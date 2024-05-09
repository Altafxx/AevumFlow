import { Request, Response } from "express"
import { stat } from "fs/promises"
import fs from "fs"

export const streamVideo = async (req: Request, res: Response) => {
    const { video } = req.params
    console.log(video)

    const videoPath = __dirname + "/../.." + "/data/vod/";

    res.writeHead(200, {
        'Content-Type': 'video/mp4',
    });

    const videoStream = fs.createReadStream(videoPath + video + ".mp4");
    videoStream.pipe(res);

    videoStream.on('error', (err) => {
        console.error('Error streaming video:', err);
        res.status(500).send('Error streaming video');
    });
}