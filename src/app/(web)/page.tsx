import { Button } from "@/components/ui/button";
import { fetchVideos } from "./action";
import VideoPlayer from "@/components/hls";
import Link from "next/link";

export default async function Home() {
  const videos = await fetchVideos();
  return (
    <main className="flex flex-col min-h-screen place-items-center py-24 space-y-4">
      <div className="font-bold text-2xl">Just Some Random Video Engine</div>
      <Button asChild>
        <Link href="/upload">
          Upload Video
        </Link>
      </Button>
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
