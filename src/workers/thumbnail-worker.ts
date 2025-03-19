import { parentPort } from 'worker_threads';
import Ffmpeg from 'fluent-ffmpeg';
import { join } from 'path';
import { PrismaClient } from '@prisma/client';
import { Client } from 'minio';
import defaultConfig from '../lib/default-config';

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
}) => {
    try {
        await new Promise((resolve, reject) => {
            Ffmpeg(data.videopath)
                .takeScreenshots({
                    count: 1,
                    timemarks: ['2'],
                    filename: data.fileName + '.webp',
                }, process.cwd() + "/data/thumbnails/")
                .on('end', resolve)
                .on('error', reject);
        });

        await minioClient.fPutObject(
            'thumbnails',
            data.fileName + ".webp",
            join(process.cwd(), "/data/thumbnails/", data.fileName + ".webp"),
            { 'Content-Type': 'image/webp' }
        );

        // Update video record with thumbnail path
        await db.video.update({
            where: { id: data.videoId },
            data: { thumbnail: "/thumbnails/" + data.fileName }
        });

        try {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const test = await fetch("http://localhost:3000/api/revalidate?path=/");
            await fetch("http://localhost:3000/api/revalidate?path=/" + data.videoId);

        } catch (error) {
            console.error('Failed to revalidate:', error);
        }


        parentPort?.postMessage({ success: true });
    } catch (error) {
        console.error('Failed to generate thumbnail:', error);
        parentPort?.postMessage({ success: false, error });
    } finally {
        await db.$disconnect();
        process.exit(0);
    }
});
