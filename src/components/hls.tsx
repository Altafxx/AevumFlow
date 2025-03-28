"use client"
import { useEffect, useRef } from 'react';
import Hls from 'hls.js';
import Plyr from 'plyr';
import 'plyr/dist/plyr.css';

const defaultHlsConfig = {
    maxBufferLength: 30,
    maxMaxBufferLength: 600,
    maxBufferSize: 60 * 1000 * 1000,
    enableWorker: true,
    debug: true,
    startLevel: -1,
    abrEwmaDefaultEstimate: 500000,
    manifestLoadingTimeOut: 20000,
    manifestLoadingMaxRetry: 6,
    manifestLoadingRetryDelay: 500,
};

export default function VideoPlayer({ src, availableResolutions = [] }: {
    src: string;
    availableResolutions?: number[];
}) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const localhost = process.env.LOCALHOST;

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const https = localhost === 'true' ? 'http://' : 'https://';
        const secureUrl = src.replace('http://', https);

        video.controls = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = secureUrl;
            /* eslint-disable @typescript-eslint/no-unused-vars */
            const player = new Plyr(video, {
                controls: [
                    'play-large',
                    'play',
                    'progress',
                    'current-time',
                    'mute',
                    'volume',
                    'settings',
                    'fullscreen'
                ],
                settings: ['quality'],
                quality: {
                    default: availableResolutions[availableResolutions.length - 1],
                    options: availableResolutions,
                    forced: true
                }
            });
        } else if (Hls.isSupported()) {
            const hls = new Hls({
                ...defaultHlsConfig,
                xhrSetup: (xhr, url) => {
                    const finalUrl = localhost === 'true' ? url : url.replace('http://', https);
                    xhr.open('GET', finalUrl);
                }
            });

            hls.loadSource(secureUrl);
            hls.attachMedia(video);

            // Basic error handling
            hls.on(Hls.Events.ERROR, (_event, data) => {
                if (data.fatal) {
                    switch (data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            hls.startLoad();
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            hls.recoverMediaError();
                            break;
                        default:
                            hls.destroy();
                            break;
                    }
                }
            });

            const player = new Plyr(video, {
                controls: [
                    'play-large',
                    'play',
                    'progress',
                    'current-time',
                    'mute',
                    'volume',
                    'settings',
                    'fullscreen'
                ],
                settings: ['quality'],
                quality: {
                    default: availableResolutions[availableResolutions.length - 1],
                    options: availableResolutions,
                    forced: true,
                    onChange: (quality: number) => {
                        const levels = hls.levels;
                        const levelIndex = levels.findIndex(level => level.height === quality);
                        if (levelIndex !== -1) {
                            hls.currentLevel = levelIndex;
                        }
                    }
                }
            });
        } else {
            console.error('This browser does not support MSE');
        }

        return () => {
            video.src = '';
        };
    }, [src, localhost, availableResolutions]);

    return (
        <div id="player" className='rounded-md overflow-clip'>
            <video
                data-displaymaxtap
                className='w-full aspect-video'
                ref={videoRef}
                playsInline
                preload="auto"
                crossOrigin="anonymous"
            />
        </div>
    );
}
