"use client"
import { useEffect, useRef } from 'react';
import Hls from 'hls.js';
import Plyr from 'plyr';
import 'plyr/dist/plyr.css';

export default function VideoPlayer({ src }: { src: string }) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const localhost = process.env.LOCALHOST

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const https = localhost ? 'http://' : 'https://';

        // Force HTTPS
        const secureUrl = src.replace('http://', https);

        video.controls = true;
        const defaultOptions = {};

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = secureUrl;
        } else if (Hls.isSupported()) {

            const hls = localhost
                ? new Hls({
                    xhrSetup: (xhr, url) => {
                        // Force HTTPS for all HLS requests
                        xhr.open('GET', url.replace('http://', https));
                    }
                })
                : new Hls({})

            hls.loadSource(secureUrl);
            /* eslint-disable @typescript-eslint/no-unused-vars */
            const player = new Plyr(video, defaultOptions);
            hls.attachMedia(video);
        } else {
            console.error(
                'This is an old browser that does not support MSE https://developer.mozilla.org/en-US/docs/Web/API/Media_Source_Extensions_API'
            );
        }
    }, [src, videoRef, localhost]);

    return (
        <div id="player" className='rounded-md overflow-clip'>
            <video data-displaymaxtap className='w-full aspect-video' ref={videoRef} />
        </div>
    );
}
