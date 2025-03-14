import { fetchVideoByID } from "@/app/action/video";
import VideoPlayer from "@/components/hls";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { notFound } from "next/navigation";
import { Clock, Share2, FolderIcon, Heart, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function VideoByID({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const video = await fetchVideoByID(+id);

    if (!video) notFound()

    return (
        <main className="flex flex-col min-h-screen py-24 px-4 space-y-8">
            <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-3 space-y-6">
                    {/* Video Player Section */}
                    <div className="rounded-xl overflow-hidden bg-card/50 backdrop-blur-sm border">
                        {video?.path ? (
                            <div className="relative group">
                                <VideoPlayer src={video?.path} />
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 transform translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                    <div className="flex items-center justify-between text-white">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                            <span className="font-medium">Now Playing</span>
                                        </div>
                                        <h2 className="text-lg font-medium line-clamp-1">
                                            {video?.title}
                                        </h2>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="aspect-video bg-card/50 backdrop-blur-sm flex items-center justify-center">
                                <div className="text-muted-foreground">Video not available</div>
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
