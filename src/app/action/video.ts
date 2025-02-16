"use server"

import { db } from "@/lib/db-client";
import { randomUUID } from "crypto";
import { writeFile } from "fs/promises";
import path from "path";

export async function fetchVideos() {
    return await db.video.findMany({
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


export async function uploadVideo(title: string, file: File, description?: string, folder?: string) {
    if (!file) return Error('No file provided');
    if (!title) return Error('No title provided');

    const ext = path.extname(file.name);
    const fileName = Date.now() + "-" + randomUUID();
    const videopath = process.cwd() + "/data/vod/" + fileName + ext;
    const jsonpath = process.cwd() + "/data/json/" + fileName + ".json";


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

    const video = await db.video.create({
        data: {
            title,
            filename: file.name,
            path: "/video/" + fileName + ".json/master.m3u8",
            ...struct
        }
    })

    return {
        message: 'Video uploaded',
        video
    }

} 