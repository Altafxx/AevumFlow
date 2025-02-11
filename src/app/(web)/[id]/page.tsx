import VideoPlayer from "@/components/hls";
import { fetchVideoByID } from "../action";

export default async function VideoByID({ id }: { id: number }) {
    const video = await fetchVideoByID(id);
    return (
        <main className="flex flex-col min-h-screen place-items-center py-24">
            <div className="font-bold text-2xl">{video?.title}</div>
            <div className="max-w-5xl rounded-md overflow-clip">
                <VideoPlayer src={video.path} />
            </div>
            <div>{video?.description}</div>

        </main>
    );
}
