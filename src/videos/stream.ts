import { Request, Response } from "express"
import { stat } from "fs/promises"
import fs from "fs"

export const streamVideo = async (req: Request, res: Response) => {
    const { video } = req.params

    const videoPath = __dirname + "/../.." + "/data/vod/";

    try {

        res.writeHead(200, {
            'Content-Type': 'video/mp4',
        });

        const videoStream = fs.createReadStream(videoPath + video + ".mp4");
        videoStream.pipe(res);

        videoStream.on('error', (err) => {
            res.status(500).send('Error streaming video');
        });
    } catch (error: any) {
        res.status(500).send('Error streaming video');

    }
}