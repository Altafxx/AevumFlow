import express from "express"
import { multerConfig } from "./utils/multer-config"
import { uploadVideo, listVideos } from "./videos/videos"
import { initialSetup } from "./setup/initial"

const app = express()

app.get('/setup', initialSetup);
app.get('/list', listVideos);
app.post("/upload", multerConfig.single("video"), uploadVideo)


const port = process.env.PORT || 9889;
app.listen(port, () => console.log(`Server listening on port ${port}`))
