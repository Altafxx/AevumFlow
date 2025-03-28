"use client"

import VideoPlayer from "./hls";

interface VideoWrapperProps {
    src: string;
    title: string;
    availableResolutions: number[];
    status?: {
        isProcessing: boolean;
        isReady: boolean;
    };
    folder?: {
        name: string;
    };
}

/* eslint-disable @typescript-eslint/no-unused-vars */
export default function VideoWrapper({ src, title, status, folder, availableResolutions }: VideoWrapperProps) {
    return (
        <div className="relative group">
            <VideoPlayer src={src} availableResolutions={availableResolutions} />
            {/* <VideoPlayer src={src} /> */}
            {/* Top overlay - always visible */}
            <div
                className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 via-black/40 to-transparent py-4 px-6 pointer-events-none"
            >
                <div className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        <span className="font-medium">Now Playing</span>
                    </div>
                    <h2 className="text-lg font-medium line-clamp-1">
                        {title}
                    </h2>
                </div>
            </div>
        </div>
    );
}
