import express, { application } from "express"
import { multerConfig } from "./utils/multer-config"
import { uploadVideo, listVideos, streamVideo } from "./videos/videos"
import { initialSetup } from "./setup/initial"

const app = express()

app.get('/setup', initialSetup);
app.get('/list', listVideos);
app.post("/upload", multerConfig.single("video"), uploadVideo)
app.get("/stream/:video", streamVideo)


const port = process.env.PORT || 9889;
app.listen(port, () => console.log(`Server listening on port ${port}`))
