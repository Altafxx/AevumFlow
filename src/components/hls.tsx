"use client"
import { useEffect, useRef } from 'react';
import Hls from 'hls.js';
import Plyr from 'plyr';
import 'plyr/dist/plyr.css';

export default function VideoPlayer({ src }: { src: string }) {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        video.controls = true;
        // const defaultOptions = {};
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            // This will run in safari, where HLS is supported natively
            video.src = src;
        } else if (Hls.isSupported()) {
            // This will run in all other modern browsers

            const hls = new Hls();
            hls.loadSource(src);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            // const player = new Plyr(video, defaultOptions);
            hls.attachMedia(video);
        } else {
            console.error(
                'This is an old browser that does not support MSE https://developer.mozilla.org/en-US/docs/Web/API/Media_Source_Extensions_API'
            );
        }
    }, [src, videoRef]);

    return (
        <div id="player" className='rounded-md overflow-clip'>
            <video data-displaymaxtap className='w-full aspect-video' ref={videoRef} />
        </div>
    );
}
