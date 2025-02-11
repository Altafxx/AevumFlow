import { fetchVideos } from "./action";
import VideoPlayer from "@/components/hls";

export default async function Home() {
  const videos = await fetchVideos();
  return (
    <main className="flex flex-col min-h-screen place-items-center py-24">
      <div className="font-bold text-2xl">Just Some Random Video Engine</div>
      <div className="max-w-5xl">
        {
          videos && videos.map((video) => (
            <div key={video?.id} className="rounded-md overflow-clip my-4">
              <div className="font-bold">{video?.title}</div>
              <div>{video?.description}</div>
            </div>
          ))
        }
      </div>
    </main>
  );
}
