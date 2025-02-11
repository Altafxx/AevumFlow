"use server";

import { db } from "@/lib/db-client";

export async function fetchVideos() {
    return await db.video.findMany()
}

export async function fetchVideoByID(id: number) {
    return await db.video.findUnique({ where: { id } })
}

export async function uploadVideo(title: string, description: string, video: any, folder: string) {
    // TODO: Process video and thumbnail using ffmpeg
    // TODO: Generate video path 
    // TODO: Upoad video to NFD server && generate json

    return await db.video.create({
        data:
        {
            title,
            description,
            filename: video.name,
            folder: {
                connectOrCreate: {
                    where: { name: folder },
                    create: { name: folder, path: "/" + folder }
                }
            },
            path: "",
            thumbnail: ""
        }
    })
}