import { parentPort } from 'worker_threads';
import Ffmpeg from 'fluent-ffmpeg';
import { join } from 'path';
import { PrismaClient } from '@prisma/client';
import { Client } from 'minio';

const db = new PrismaClient();

// Initialize Minio client in the worker
const minioClient = new Client({
    endPoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: parseInt(process.env.MINIO_PORT || '9000'),
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY || 'root',
    secretKey: process.env.MINIO_SECRET_KEY || 'password',
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