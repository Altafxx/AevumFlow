import { parentPort } from 'worker_threads';
import Ffmpeg from 'fluent-ffmpeg';
import { join } from 'path';
import { PrismaClient } from '@prisma/client';
import { Client } from 'minio';
import defaultConfig from '../lib/default-config';
import { copyFile, writeFile, rm } from 'fs/promises';

const db = new PrismaClient();

const config = defaultConfig();

/* eslint-disable @typescript-eslint/no-unused-vars */
const minioClient = new Client({
    endPoint: config.minio.endPoint,
    port: config.minio.port,
    useSSL: config.minio.useSSL,
    accessKey: config.minio.accessKey,
    secretKey: config.minio.secretKey,
});

interface Resolution {
    width: number;
    height: number;
    name: string;
}

interface KalturaManifest {
    sequences: {
        clips: {
            type: string;
            path: string;
        }[];
    }[];
}

const getResolutions = (originalHeight: number): Resolution[] => {
    /* eslint-disable @typescript-eslint/no-unused-vars */
    const resolutions: Resolution[] = [];
    const possibleResolutions = [
        { width: 3840, height: 2160, name: '4k' },
        { width: 2560, height: 1440, name: '2k' },
        { width: 1920, height: 1080, name: '1080p' },
        { width: 1280, height: 720, name: '720p' },
        { width: 854, height: 480, name: '480p' },
        { width: 640, height: 360, name: '360p' }
    ];

    // Only include resolutions lower than the original
    return possibleResolutions.filter(res => res.height < originalHeight);
};

const processVideo = async (inputPath: string, outputPath: string, resolution: Resolution): Promise<void> => {
    return new Promise((resolve, reject) => {
        Ffmpeg(inputPath)
            .size(`${resolution.width}x${resolution.height}`)
            // Add keyframe settings
            .addOption('-g', '48') // Keyframe every 48 frames
            .addOption('-keyint_min', '48')
            // Add better encoding settings
            .addOption('-preset', 'fast') // Balance between speed and quality
            .addOption('-profile:v', 'high')
            .addOption('-level', '4.1')
            // Add better bitrate control
            .videoBitrate(getBitrateForResolution(resolution.height), true) // true enables CBR
            .addOption('-maxrate', `${getBitrateForResolution(resolution.height)}k`)
            .addOption('-bufsize', `${getBitrateForResolution(resolution.height) * 2}k`)
            // Add better audio settings
            .audioCodec('aac')
            .audioBitrate('128k')
            .videoCodec('libx264')
            .format('mp4')
            .on('end', () => resolve())
            .on('error', reject)
            .save(outputPath);
    });
};

const getOriginalResolutionName = (height: number): string => {
    const possibleResolutions = [
        { height: 2160, name: '4k' },
        { height: 1440, name: '2k' },
        { height: 1080, name: '1080p' },
        { height: 720, name: '720p' },
        { height: 480, name: '480p' },
        { height: 360, name: '360p' }
    ];

    // Find the closest matching resolution
    const resolution = possibleResolutions.find(res => res.height === height)
        || possibleResolutions[0]; // Default to highest if no match
    return resolution.name;
};

const updateJsonManifest = async (fileName: string, folderPath: string, resolutions: Resolution[]): Promise<void> => {
    const jsonPath = join(process.cwd(), '/data/json/', folderPath, `${fileName}.json`);
    const ext = '.mp4';

    // Create manifest with each resolution in its own sequence
    const manifest: KalturaManifest = {
        sequences: resolutions.map(resolution => ({
            clips: [{
                type: 'source',
                path: `/etc/nginx/vod/${folderPath ? folderPath + '/' : ''}${fileName}_${resolution.name}${ext}`
            }]
        }))
    };

    // Write JSON manifest
    await writeFile(jsonPath, JSON.stringify(manifest, null, 4));
};

parentPort?.on('message', async (data: {
    fileName: string;
    videopath: string;
    videoId: number;
    folderPath: string;
}) => {
    try {
        const metadata = await new Promise<Ffmpeg.FfprobeData>((resolve, reject) => {
            Ffmpeg.ffprobe(data.videopath, (err, metadata) => {
                if (err) reject(err);
                else resolve(metadata);
            });
        });

        const videoStream = metadata.streams.find(s => s.codec_type === 'video');
        if (!videoStream || !videoStream.height) {
            throw new Error('No video stream found or invalid height');
        }

        const originalHeight = videoStream.height;
        const originalResolutionName = getOriginalResolutionName(originalHeight);

        // Create paths with folder structure
        const vodFolderPath = join(process.cwd(), "data/vod", data.folderPath);

        // Rename the original file with its resolution
        const originalFileName = `${data.fileName}_${originalResolutionName}.mp4`;
        const originalPath = join(vodFolderPath, originalFileName);

        const rawFileName = `${data.fileName}_raw.mp4`;
        const rawPath = join(vodFolderPath, rawFileName);

        await copyFile(data.videopath, originalPath);
        await copyFile(data.videopath, rawPath);

        // Get lower resolutions to process
        const resolutionsToProcess = getResolutions(originalHeight);

        // Process each lower resolution
        for (const resolution of resolutionsToProcess) {
            const outputFileName = `${data.fileName}_${resolution.name}.mp4`;
            const outputPath = join(vodFolderPath, outputFileName);

            await processVideo(originalPath, outputPath, resolution);

            // Update database with new version
            await db.videoVersion.create({
                data: {
                    videoId: data.videoId,
                    resolution: resolution.name,
                    path: `/video/${data.folderPath ? data.folderPath + '/' : ''}${data.fileName}.json/master.m3u8`
                }
            });
        }

        // Add original version to database
        await db.videoVersion.create({
            data: {
                videoId: data.videoId,
                resolution: originalResolutionName,
                path: `/video/${data.folderPath ? data.folderPath + '/' : ''}${data.fileName}.json/master.m3u8`
            }
        });

        // Update JSON manifest
        await updateJsonManifest(data.fileName, data.folderPath, [
            {
                width: videoStream.width || 0,
                height: originalHeight,
                name: originalResolutionName
            },
            ...resolutionsToProcess
        ]);

        // After all processing is done, update isProcessing to false
        await db.video.update({
            where: { id: data.videoId },
            data: { isProcessing: false }
        });

        await rm(data.videopath);

        try {
            // Revalidate pages
            await fetch("http://localhost:3000/api/revalidate?path=/");
            await fetch("http://localhost:3000/api/revalidate?path=/" + data.videoId);
        } catch (error) {
            console.error('Failed to revalidate:', error);
        }

        parentPort?.postMessage({ success: true });
    } catch (error) {
        console.error('Failed to process video resolutions:', error);

        // Update isProcessing to false even if there's an error
        try {
            await db.video.update({
                where: { id: data.videoId },
                data: { isProcessing: false }
            });
        } catch (updateError) {
            console.error('Failed to update processing status:', updateError);
        }

        parentPort?.postMessage({ success: false, error });
    } finally {
        try {
            await db.video.update({
                where: { id: data.videoId },
                data: {
                    isProcessing: false,
                    isReady: true
                }
            });
        } catch (error) {
            console.error('Failed to update video status:', error);
        }
        await db.$disconnect();
        process.exit(0);
    }
});

// Add this helper function to calculate appropriate bitrates
function getBitrateForResolution(height: number): number {
    const bitrates = {
        2160: 45000, // 4K
        1440: 16000, // 2K
        1080: 8000,  // Full HD
        720: 5000,   // HD
        480: 2500,   // SD
        360: 1000    // Low
    };

    return bitrates[height as keyof typeof bitrates] || 1000; // Default to 1000k if height not found
}
