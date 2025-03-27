import { parentPort } from 'worker_threads';
import Ffmpeg from 'fluent-ffmpeg';
import { join } from 'path';
import { PrismaClient } from '@prisma/client';
import { Client } from 'minio';
import defaultConfig from '../lib/default-config';
import { mkdir, unlink } from 'fs/promises';
import { tmpdir } from 'os';

const db = new PrismaClient();

// Initialize Minio client in the worker
const config = defaultConfig();

const minioClient = new Client({
    endPoint: config.minio.endPoint,
    port: config.minio.port,
    useSSL: config.minio.useSSL,
    accessKey: config.minio.accessKey,
    secretKey: config.minio.secretKey,
});

parentPort?.on('message', async (data: {
    fileName: string;
    videopath: string;
    videoId: number;
    folderPath: string;
}) => {
    const tempThumbnailPath = join(tmpdir(), 'video-thumbnails');
    const thumbnailFile = join(tempThumbnailPath, `${data.fileName}.webp`);

    try {
        // Ensure temporary directory exists
        await mkdir(tempThumbnailPath, { recursive: true });

        // Generate thumbnail
        await new Promise((resolve, reject) => {
            Ffmpeg(data.videopath)
                .takeScreenshots({
                    count: 1,
                    timemarks: ['2'],
                    filename: `${data.fileName}.webp`,
                }, tempThumbnailPath)
                .on('end', resolve)
                .on('error', reject);
        });

        // Upload to MinIO without folder structure
        await minioClient.fPutObject(
            'thumbnails',
            `${data.fileName}.webp`,
            thumbnailFile,
            { 'Content-Type': 'image/webp' }
        );

        await db.video.update({
            where: { id: data.videoId },
            data: {
                thumbnail: `/thumbnails/${data.fileName}`
            }
        });

        try {
            // Revalidate pages
            await fetch("http://localhost:3000/api/revalidate?path=/");
            await fetch("http://localhost:3000/api/revalidate?path=/" + data.videoId);
        } catch (error) {
            console.error('Failed to revalidate:', error);
        }

        parentPort?.postMessage({ success: true });
    } catch (error) {
        console.error('Failed to generate thumbnail:', error);
        parentPort?.postMessage({ success: false, error });
    } finally {
        // Clean up: Remove temporary thumbnail file
        try {
            await unlink(thumbnailFile);
        } catch (error) {
            console.error('Failed to clean up thumbnail file:', error);
        }

        await db.$disconnect();
        process.exit(0);
    }
});
