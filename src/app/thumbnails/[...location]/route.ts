import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from 'fs';
import { join } from "path";
import { redirect } from "next/navigation";
export async function GET(request: NextRequest, { params }: { params: Promise<{ location: string }> }) {
    try {
        const location = (await params).location;
        const thumbnail = location.length ? Object.values(location).join('/') : location
        const path = join(process.cwd(), "data", "thumbnails", `${thumbnail}.webp`);
        const image = await fs.readFile(path);

        const buffer = Buffer.from(image);

        const headers = new Headers();
        headers.set("Content-Type", "image/webp");

        return new NextResponse(buffer, { status: 200, statusText: "OK", headers });

        /* eslint-disable @typescript-eslint/no-unused-vars */
    } catch (_) {
        redirect('/thumbnail.webp');
    }
}