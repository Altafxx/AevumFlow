import { fetchVideoByID, fetchVideos } from '@/app/action/video'
import { fetchFolders } from '@/app/action/folder'
import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { ApiError } from 'next/dist/server/api-utils'
import { revalidatePath } from 'next/cache'

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

app.get('/revalidate', async (c) => {
    const params = c.req.query()

    if (!params.path) throw new ApiError(400, 'Path is required')

    revalidatePath(params.path)

    return c.json({ message: 'Revalidated' })
})

export const GET = handle(app)
// export const POST = handle(app)
