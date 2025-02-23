"use server"

import { db } from "@/lib/db-client";
import { minioClient } from "@/lib/minio-client";
import { randomUUID } from "crypto";
import Ffmpeg from "fluent-ffmpeg";
import { writeFile } from "fs/promises";
import { revalidatePath } from "next/cache";
import path, { join } from "path";
import { initializeMinio } from "./minio";

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

    if (folder) struct['folderID'] = +folder
    if (description) struct['description'] = description

    const buffer = Buffer.from(await file.arrayBuffer());
    const jsonbuffer = Buffer.from(JSON.stringify(source));

    Ffmpeg(videopath)
        .takeScreenshots({
            count: 1,
            timemarks: ['2'], // number of seconds
            filename: fileName + '.webp',
        }, process.cwd() + "/data/thumbnails/"
        )

    await writeFile(
        jsonpath,
        jsonbuffer
    );

    await writeFile(
        videopath,
        buffer
    );

    /* NOTES: Purposely delay to resolve file not found*/
    await new Promise((resolve) => setTimeout(resolve, 5000));

    await minioClient.fPutObject('thumbnails', fileName + ".webp", join(process.cwd(), "/data/thumbnails/", fileName + ".webp"), {
        'Content-Type': 'image/webp'
    });

    const video = await db.video.create({
        data: {
            title,
            filename: file.name,
            path: "/video/" + fileName + ".json/master.m3u8",
            thumbnail: "/thumbnails/" + fileName,
            ...struct
        }
    })

    revalidatePath('/')

    return {
        message: 'Video uploaded',
        video
    }

} 