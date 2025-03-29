import { fetchVideoByID } from "@/app/action/video";
import VideoWrapper from "@/components/video-wrapper";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
// import { CardFooter } from "@/components/ui/card";
import { notFound } from "next/navigation";
import { Clock, FolderIcon, Loader2 } from "lucide-react";
// import { Share2, Heart, MessageSquare } from "lucide-react";
// import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

const getResolutionHeight = (resolution: string): number => {
    if (resolution.toLowerCase() === '4k') return 2160;
    if (resolution.toLowerCase() === '2k') return 1440;
    return parseInt(resolution.toLowerCase().replace('p', ''));
};

export default async function VideoByID({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const video = await fetchVideoByID(+id);

    if (!video) notFound()

    // Sort versions by resolution
    const sortedVersions = [...(video.versions || [])].sort(
        (a, b) => getResolutionHeight(a.resolution) - getResolutionHeight(b.resolution)
    );

    const availableResolutions = video.versions
        .map(v => getResolutionHeight(v.resolution))
        .sort((a, b) => b - a); // Sort in descending order

    return (
        <main className="flex flex-col min-h-screen py-24 px-4 space-y-8">
            <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-3 space-y-6">
                    {/* Video Player Section */}
                    <div className="rounded-xl overflow-hidden bg-card/50 backdrop-blur-sm border">
                        {video?.path && !video.isProcessing ? (
                            <VideoWrapper src={video.path} title={video.title} availableResolutions={availableResolutions} />
                        ) : (
                            <div className="aspect-video bg-card/50 backdrop-blur-sm relative">
                                <Image
                                    src={video.thumbnail ? `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}${video.thumbnail}.webp` : "/thumbnail.webp"}
                                    alt={video?.title}
                                    fill
                                    className="object-cover"
                                />
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                    {video.isProcessing ? (
                                        <div className="flex items-center gap-2 text-white">
                                            <Loader2 className="w-6 h-6 animate-spin" />
                                            <span>Processing video...</span>
                                        </div>
                                    ) : (
                                        <div className="text-muted-foreground">Video not available</div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Video Info Card */}
                    <Card className="bg-card/50 backdrop-blur-sm border">
                        <CardHeader className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h1 className="text-2xl font-bold">{video?.title}</h1>
                                {video?.folder?.name && (
                                    <Link href="/folders" className="flex items-center gap-2 text-sm bg-primary/10 text-primary rounded-full px-4 py-2 hover:bg-primary/20 transition-colors">
                                        <FolderIcon size={16} />
                                        {video?.folder?.name}
                                    </Link>
                                )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <Clock size={16} />
                                    {new Date(video?.createdAt).toLocaleDateString(undefined, {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-muted-foreground whitespace-pre-wrap">
                                {video?.description || "No description provided."}
                            </p>
                            {/* <div className="flex items-center gap-3">
                                <Button variant="secondary" size="sm" className="gap-2">
                                    <Heart size={16} />
                                    Like
                                </Button>
                                <Button variant="secondary" size="sm" className="gap-2">
                                    <Share2 size={16} />
                                    Share
                                </Button>
                                <Button variant="secondary" size="sm" className="gap-2">
                                    <MessageSquare size={16} />
                                    Comment
                                </Button>
                            </div> */}
                        </CardContent>
                    </Card>

                    {/* Available Resolutions Card */}
                    <Card className="bg-card/50 backdrop-blur-sm border">
                        <CardHeader>
                            <h2 className="text-xl font-semibold">Available Resolutions</h2>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {sortedVersions.map((version) => (
                                    <div
                                        key={version.id}
                                        className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm"
                                    >
                                        {version.resolution}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                {/* <div className="space-y-6">
                    <div className="sticky top-24">
                        <h3 className="text-lg font-medium mb-4">Related Videos</h3>
                        <div className="space-y-4">
                            <div className="text-sm text-muted-foreground text-center py-8">
                                Coming soon...
                            </div>
                        </div>
                    </div>
                </div> */}
            </div>
        </main>
    );
}
