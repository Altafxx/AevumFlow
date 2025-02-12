"use server"

import { db } from "@/lib/db-client";

export async function fetchFolders() {
    const folder = await db.folder.findMany();

}