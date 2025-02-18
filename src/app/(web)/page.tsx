import { Button } from "@/components/ui/button";
import Link from "next/link";
import { fetchVideos } from "../action/video";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { Video, Folder } from "@prisma/client";

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
      <div className="max-w-5xl w-full max-xl:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {
          videos && videos.map((video: Video & { folder: Folder | null }) => (
            <Link href={`/${video?.id}`} key={video?.id}>
              <Card key={video?.id} className="h-full">
                <CardHeader className="relative">
                  <Image
                    src={video?.thumbnail ?? "/thumbnail.webp"}
                    alt={video?.title}
                    width={640}
                    height={360}
                    layout="responsive"
                    className="rounded-t-lg"
                  />
                  {
                    video?.folder?.name && (
                      <div className="flex absolute right-2 top-2 bg-primary text-secondary rounded-md px-4 py-2">{video?.folder?.name}</div>
                    )
                  }
                </CardHeader>
                <CardContent>
                  <CardTitle>{video?.title}</CardTitle>
                  <CardDescription className="">{video?.description}</CardDescription>
                </CardContent>
                <CardFooter>
                  <div className="text-sm text-gray-500">
                    {new Date(video?.createdAt).toUTCString()}
                  </div>
                </CardFooter>
              </Card>
            </Link>
          ))
        }
        {
          videos.length === 0 && (
            <div className="text-center text-gray-500">
              No videos found
            </div>
          )
        }
      </div>
    </main>
  );
}
