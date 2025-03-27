"use server"
import { db } from "@/lib/db-client";
import { revalidatePath } from "next/cache";
import { mkdir } from "fs/promises";
import { join } from "path";

export async function fetchFolders() {
    const folder = await db.folder.findMany({
        orderBy: {
            createdAt: 'desc'
        }
    });

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

    // Create the physical folder structure
    const folderPath = path.replace(/^\//, ''); // Remove leading slash
    const vodFolderPath = join(process.cwd(), "data/vod", folderPath);
    const jsonFolderPath = join(process.cwd(), "data/json", folderPath);

    try {
        // Create both folders concurrently
        await Promise.all([
            mkdir(vodFolderPath, { recursive: true }),
            mkdir(jsonFolderPath, { recursive: true })
        ]);
    } catch (error) {
        console.error('Failed to create folder structure:', error);
        return Error('Failed to create folder structure');
    }

    const folder = await db.folder.create({
        data: {
            name,
            path
        },
        select: {
            id: true,
            name: true,
            path: true,
            createdAt: true
        }
    })

    revalidatePath('/folders');
    return { message: 'Folder created', folder };
}
export async function deleteFolder(id: number) {
    try {
        await db.folder.delete({
            where: { id }
        });

        revalidatePath('/folders');
        return { message: 'Folder deleted successfully' };
        //eslint-disable-next-line  @typescript-eslint/no-unused-vars
    } catch (error) {
        return Error('Failed to delete folder');
    }
}

export async function fetchFoldersWithStats() {
    const folders = await db.folder.findMany({
        orderBy: {
            createdAt: 'desc'
        },
        include: {
            _count: {
                select: { Video: true }
            }
        }
    });

    return folders.map(folder => ({
        ...folder,
        videoCount: folder._count.Video
    }));
}
