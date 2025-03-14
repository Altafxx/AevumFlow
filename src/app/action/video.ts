"use server"

import { db } from "@/lib/db-client";
import { randomUUID } from "crypto";
import { writeFile } from "fs/promises";
import { revalidatePath } from "next/cache";
import path, { join } from "path";
import { initializeMinio } from "./minio";
import { Worker } from 'worker_threads';

export async function fetchVideos() {
    return await db.video.findMany({
        orderBy: {
            createdAt: 'desc'
        },
        include: {
            folder: true
        }
    })
}

export async function fetchVideoByID(id: number) {
    return await db.video.findUnique({
        where: { id },
        include: {
            folder: true
        }
    })
}

export async function uploadVideo(title: string, file: File, description?: string, folderID?: string) {
    if (!file) return Error('No file provided');
    if (!title) return Error('No title provided');

    await initializeMinio()

    const ext = path.extname(file.name);
    const fileName = randomUUID();
    const videopath = process.cwd() + "/data/vod/" + fileName + ext;
    const jsonpath = process.cwd() + "/data/json/" + fileName + ".json";
    const folder = folderID
        ? await db.folder.findUnique({ where: { id: +folderID } })
        : null

    const struct: { folderID?: number; description?: string } = {}

    const source = {
        "sequences": [
            {
                "clips": [
                    {
                        "type": "source",
                        "path": "/etc/nginx/vod/" + fileName + ext
                    }
                ]
            }
        ]
    }

    if (folder && folderID) struct['folderID'] = +folderID
    if (description) struct['description'] = description

    const buffer = Buffer.from(await file.arrayBuffer());
    const jsonbuffer = Buffer.from(JSON.stringify(source));

    await writeFile(jsonpath, jsonbuffer);
    await writeFile(videopath, buffer);

    // Create video entry first without thumbnail
    const video = await db.video.create({
        data: {
            title,
            filename: file.name,
            path: "/video/" + fileName + ".json/master.m3u8",
            thumbnail: null, // Set to null initially
            ...struct
        }
    })

    // Start thumbnail generation in worker
    generateThumbnailInWorker(fileName, videopath, video.id);

    revalidatePath('/')

    return {
        message: 'Video uploaded',
        video
    }
}

async function generateThumbnailInWorker(fileName: string, videopath: string, videoId: number) {
    try {
        const worker = new Worker(join(process.cwd(), 'src', 'workers', 'thumbnail-worker.ts'), {
            workerData: {
                env: process.env
            },
            execArgv: ['--require', 'ts-node/register']
        });

        worker.postMessage({ fileName, videopath, videoId });

        worker.on('error', (error) => {
            console.error('Thumbnail worker error:', error);
        });

        worker.on('exit', (code) => {
            if (code !== 0) {
                console.error(`Thumbnail worker stopped with exit code ${code}`);
            }
        });
    } catch (error) {
        console.error('Failed to start thumbnail worker:', error);
    }
}
