"use server"

import { db } from "@/lib/db-client";
import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import { revalidatePath } from "next/cache";
import path, { join } from "path";
import { initializeMinio } from "./minio";
import { Worker } from 'worker_threads';
import { tmpdir } from "os";

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
            folder: true,
            versions: true,
        }
    })
}

export async function uploadVideo(title: string, file: File, description?: string, folderID?: string) {
    if (!file) return Error('No file provided');
    if (!title) return Error('No title provided');

    await initializeMinio();

    const ext = path.extname(file.name);
    const fileName = randomUUID();

    // Get folder information if folderID is provided
    const folder = folderID
        ? await db.folder.findUnique({ where: { id: +folderID } })
        : null;

    // Get folder path
    const folderPath = folder ? folder.path.replace(/^\//, '') : ''; // Remove leading slash
    const vodFolderPath = join(tmpdir(), 'video-upload')
    const jsonFolderPath = join(process.cwd(), "data/json", folderPath);

    await mkdir(vodFolderPath, { recursive: true });


    // Create file paths with folder structure
    const videopath = join(vodFolderPath, fileName + ext);
    const jsonpath = join(jsonFolderPath, fileName + ".json");


    const struct: { folderID?: number; description?: string } = {};

    // Initial empty manifest
    const source = {
        "sequences": [
            {
                "clips": []
            }
        ]
    };

    if (folder && folderID) struct['folderID'] = +folderID;
    if (description) struct['description'] = description;

    const buffer = Buffer.from(await file.arrayBuffer());
    const jsonbuffer = Buffer.from(JSON.stringify(source));

    // Write files and wait for completion
    await Promise.all([
        writeFile(jsonpath, jsonbuffer),
        writeFile(videopath, buffer)
    ]);

    // Add a small delay to ensure files are fully written
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Create video entry first without thumbnail
    const video = await db.video.create({
        data: {
            title,
            filename: file.name,
            path: `/video/${folderPath ? folderPath + '/' : ''}${fileName}.json/master.m3u8`,
            thumbnail: null,
            ...struct
        }
    });

    // Start both workers with folder information
    generateResolutionsInWorker(fileName, videopath, video.id, folderPath);
    generateThumbnailInWorker(fileName, videopath, video.id, folderPath);

    // Revalidate after ensuring files are written
    revalidatePath('/');

    return {
        message: 'Video uploaded',
        video
    }
}

async function generateThumbnailInWorker(fileName: string, videopath: string, videoId: number, folderPath: string) {
    try {
        const worker = new Worker(join(process.cwd(), 'src', 'workers', 'thumbnail-worker.ts'), {
            workerData: {
                env: process.env
            },
            execArgv: ['--require', 'ts-node/register']
        });

        worker.postMessage({ fileName, videopath, videoId, folderPath });

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

async function generateResolutionsInWorker(fileName: string, videopath: string, videoId: number, folderPath: string) {
    try {
        const worker = new Worker(join(process.cwd(), 'src', 'workers', 'resolution-worker.ts'), {
            workerData: {
                env: process.env
            },
            execArgv: ['--require', 'ts-node/register']
        });

        worker.postMessage({ fileName, videopath, videoId, folderPath });

        worker.on('error', (error) => {
            console.error('Resolution worker error:', error);
        });

        worker.on('exit', (code) => {
            if (code !== 0) {
                console.error(`Resolution worker stopped with exit code ${code}`);
            }
        });
    } catch (error) {
        console.error('Failed to start resolution worker:', error);
    }
}
