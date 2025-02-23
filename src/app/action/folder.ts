"use server"
import { db } from "@/lib/db-client";

export async function fetchFolders() {
    const folder = await db.folder.findMany();

    return folder;

}

export async function createFolder(name: string) {
    const path = "/" + name.replaceAll(" ", "-").toLowerCase();

    const checkFolder = await db.folder.findMany({
        where: {
            OR: [
                { name },
                { path }
            ]
        }
    })

    if (checkFolder.length > 0) {
        return Error('Folder already exists');
    }

    const folder = await db.folder.create({
        data: {
            name,
            path
        },
        select: {
            id: true,
            name: true
        }
    })

    return { message: 'Folder created', folder };
}