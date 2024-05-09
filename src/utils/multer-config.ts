import multer from "multer"
import { extname } from "path"
import { writeFile, mkdir } from "fs/promises"

const limits = { fileSize: 1000000000 }

const storage = multer.diskStorage({
    destination: "data/vod/",
    filename: async (req, file, cb) => {
        const originalname = file.originalname
        const extension = extname(originalname)

        const { company } = req.body
        const uploadPath = __dirname + "/../.." + "/data/vod/" + (company ? company + "/" : "")
        await mkdir(uploadPath, { recursive: true })

        const filename = `${req.body.company ? req.body.company + "/" : ""}${Date.now()}${extension}`
        cb(null, filename)
    }
})

export const multerConfig = multer({
    storage,
    limits,
    fileFilter: (req, file, cb) => {
        const allowedExtensions = [".mp4", ".avi", ".mov"]
        const ext = extname(file.originalname)
        if (!allowedExtensions.includes(ext.toLowerCase())) {
            return cb(new Error("Invalid file type. Only video files allowed."))
        }
        cb(null, true)
    }
})