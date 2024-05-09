import { Request, Response } from "express"
import { writeFile } from "fs/promises"
import { insertVideoData } from "../utils/bettersqlite-db"
import Queue from 'bull';

const ffmpegQueue = new Queue('ffmpeg-queue');

export const uploadVideo = async (req: Request, res: Response) => {
    const { title, description, company } = req.body

    if (!title || !description || !req.file) {
        return res.status(400).json({ message: "Title, description, and video are required!" })
    }

    const { originalname, filename, path, mimetype, size } = req.file

    const jsonData = {
        originalname: originalname,
        filename: filename,
        path: path,
        mimetype: mimetype,
        size: size,
        company: company ?? null
    }

    const uploadPath = __dirname + "/../.." + "/data/uploads/"

    try {
        await insertVideoData(title, description, filename);
        // await ffmpegQueue.add({ filename })

        await writeFile(uploadPath + filename + ".json", JSON.stringify(jsonData, null, 2));
        console.log(`JSON file created:`);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error uploading video" });
    }

    console.log(`Uploaded video: ${originalname} (filename: ${filename}, path: ${path})`)

    res.json({ message: "Video uploaded successfully!" })
}