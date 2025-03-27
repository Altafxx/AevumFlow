"use client"
import { useEffect, useRef } from 'react';
import Hls from 'hls.js';
import Plyr from 'plyr';
import 'plyr/dist/plyr.css';

const defaultHlsConfig = {
    maxBufferLength: 30,
    maxMaxBufferLength: 600,
    maxBufferSize: 60 * 1000 * 1000, // 60MB
    maxBufferHole: 0.5,
    lowLatencyMode: false,
    backBufferLength: 90,
    enableWorker: true,
    startLevel: -1, // Auto
    abrEwmaDefaultEstimate: 500000, // 500 kbps default
    abrBandWidthFactor: 0.95,
    abrBandWidthUpFactor: 0.7,
    abrMaxWithRealBitrate: true,
};

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

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = secureUrl;
        } else if (Hls.isSupported()) {
            const hls = localhost
                ? new Hls({
                    ...defaultHlsConfig,
                    xhrSetup: (xhr, url) => {
                        // Force HTTPS for all HLS requests
                        xhr.open('GET', url.replace('http://', https));
                    }
                })
                : new Hls(defaultHlsConfig);

            hls.loadSource(secureUrl);

            /* eslint-disable @typescript-eslint/no-unused-vars */
            const player = new Plyr(video, {
                quality: {
                    default: 576,
                    options: [4320, 2160, 1440, 1080, 720, 576, 480, 360, 240]
                }
            });
            hls.attachMedia(video);

            // Add quality switching event handler
            hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
                // Optional: Add your own quality change indicator UI here
            });
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
