import { fetchVideoByID, fetchVideos } from '@/app/action/video'
import { fetchFolders } from '@/app/action/folder'
import { Hono } from 'hono'
import { handle } from 'hono/vercel'

// export const runtime = 'edge'

const app = new Hono().basePath('/api')

app.get('/videos', async (c) => {
    const videos = await fetchVideos()

    return c.json(videos)
})

app.get('/videos/:id', async (c) => {
    const video = await fetchVideoByID(+c.req.param('id'))

    return c.json(video)
})

app.get('folder', async (c) => {
    const folder = await fetchFolders()

    return c.json(folder)
})

export const GET = handle(app)
// export const POST = handle(app)
