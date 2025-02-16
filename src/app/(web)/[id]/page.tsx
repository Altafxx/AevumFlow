import { fetchVideoByID } from "@/app/action/video";
import VideoPlayer from "@/components/hls";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { notFound } from "next/navigation";


export default async function VideoByID({ params }: { params: Promise<{ id: number }> }) {
    const { id } = await params;
    const video = await fetchVideoByID(+id);

    if (!video) notFound()

    return (
        <main className="flex flex-col min-h-screen place-items-center py-24 px-4 space-y-4">
            <div className="max-w-5xl rounded-md overflow-clip w-full">
                {
                    video?.path && <VideoPlayer src={video.path} />
                }
            </div>
            <Card className="relative max-w-5xl w-full">
                <CardHeader>{
                    video?.folder?.name && (
                        <div className="flex absolute right-2 top-2 bg-primary text-secondary rounded-md px-4 py-2">{video?.folder?.name}</div>
                    )
                }</CardHeader>
                <CardContent>
                    <div className="font-bold text-2xl">{video?.title}</div>
                    <div>{video?.description}</div>
                </CardContent>
                <CardFooter>
                    <div className="text-sm text-gray-500">
                        {new Date(video?.createdAt).toUTCString()}
                    </div>
                </CardFooter>
            </Card>

        </main>
    );
}
