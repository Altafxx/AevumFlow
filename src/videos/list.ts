import { Request, Response } from "express"
import { getAllVideoData } from "../utils/bettersqlite-db"

export const listVideos = async (req: Request, res: Response) => {
    try {
        const videoData = await getAllVideoData();
        res.json(videoData);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving video data'); // Handle errors appropriately
    }
}