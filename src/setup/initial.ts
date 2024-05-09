import { Request, Response } from "express"
import { createTableIfNotExists } from "../utils/bettersqlite-db";

export const initialSetup = async (req: Request, res: Response) => {
    try {
        await createTableIfNotExists()
        res.status(200).json({ message: 'Table created successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving video data'); // Handle errors appropriately
    }
}