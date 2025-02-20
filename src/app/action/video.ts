"use server"

import { db } from "@/lib/db-client";
import { randomUUID } from "crypto";
import Ffmpeg from "fluent-ffmpeg";
import { writeFile } from "fs/promises";
import { revalidatePath } from "next/cache";
import path from "path";

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

    await writeFile(
        jsonpath,
        jsonbuffer
    );

    await writeFile(
        videopath,
        buffer
    );

    Ffmpeg(videopath)
        .takeScreenshots({
            count: 1,
            timemarks: ['3'], // number of seconds
            filename: fileName + '.webp',
        }, process.cwd() + "/data/thumbnails/"
        );

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