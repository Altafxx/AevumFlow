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

        const https = process.env.NODE_ENV === 'production' ? 'https://' : 'http://';

        // Force HTTPS
        const secureUrl = src.replace('http://', https);

        video.controls = true;
        const defaultOptions = {};

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = secureUrl;
        } else if (Hls.isSupported()) {
            const hls = new Hls({
                xhrSetup: (xhr, url) => {
                    // Force HTTPS for all HLS requests
                    xhr.open('GET', url.replace('http://', https));
                }
            });
            hls.loadSource(secureUrl);
            // eslint-disable-next-line  no-unused-vars
            const player = new Plyr(video, defaultOptions);
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
