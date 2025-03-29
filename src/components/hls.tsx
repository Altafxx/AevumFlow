"use client"
import { useEffect, useRef } from 'react';
import Hls from 'hls.js';
import Plyr from 'plyr';
import 'plyr/dist/plyr.css';

const defaultHlsConfig = {
    // Increase buffer sizes significantly for 4K content
    maxBufferLength: 120,              // Doubled from 60
    maxMaxBufferLength: 1200,          // Doubled from 600
    maxBufferSize: 4000 * 1000 * 1000, // Increased to 4GB for 4K content
    maxBufferHole: 2,                  // Increased for larger segments

    // Adjust loading parameters
    manifestLoadingTimeOut: 30000,     // Increased timeout for manifest
    manifestLoadingMaxRetry: 6,        // More retries
    manifestLoadingRetryDelay: 1000,
    levelLoadingTimeOut: 30000,        // Increased timeout for levels
    levelLoadingMaxRetry: 6,
    levelLoadingRetryDelay: 1000,
    fragLoadingTimeOut: 180000,        // Increased for large segments (3 minutes)
    fragLoadingMaxRetry: 8,
    fragLoadingRetryDelay: 1000,
    fragLoadingMaxRetryTimeout: 120000,

    // Performance optimizations
    enableWorker: true,
    startLevel: -1,                    // Auto
    abrEwmaDefaultEstimate: 10000000,  // Increased bandwidth estimate (10mbps)
    abrBandWidthFactor: 0.95,
    abrBandWidthUpFactor: 0.7,
    abrMaxWithRealBitrate: true,
    maxFragLookUpTolerance: 1.0,

    // Additional tweaks for high-quality content
    testBandwidth: true,
    progressive: true,
    lowLatencyMode: false,
    backBufferLength: 180,             // Increased for smoother playback

    // Chunk processing
    maxLoadingDelay: 8,
    startFragPrefetch: true,
    highBufferWatchdogPeriod: 8,
};

export default function VideoPlayer({ src, availableResolutions = [] }: {
    src: string;
    availableResolutions?: number[];
}) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const hlsRef = useRef<Hls | null>(null);  // Add this ref to store HLS instance
    const localhost = process.env.LOCALHOST;

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const https = localhost === 'true' ? 'http://' : 'https://';
        const secureUrl = src.replace('http://', https);

        // Add configuration for high-resolution content
        const customConfig = {
            ...defaultHlsConfig,
            // Increase initial bandwidth estimate for faster high-quality playback
            abrEwmaDefaultEstimate: 50000000, // 50mbps initial estimate
            // Increase fragment load timeout for larger segments
            fragLoadingTimeOut: 300000, // 5 minutes
            // Enable more aggressive buffering
            maxBufferSize: 8000 * 1000 * 1000, // 8GB buffer size
            maxBufferLength: 240, // 4 minutes
            // Improve stability for high-bitrate content
            liveSyncDurationCount: 7,
            liveMaxLatencyDurationCount: 10,
            // Enable better segment handling
            stretchShortVideoTrack: true,
            maxFragLookUpTolerance: 0.5
        };

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
                ...customConfig,
                xhrSetup: (xhr, url) => {
                    const finalUrl = localhost === 'true' ? url : url.replace('http://', https);
                    xhr.open('GET', finalUrl);
                }
            });
            hlsRef.current = hls;  // Store HLS instance

            hls.loadSource(secureUrl);
            hls.attachMedia(video);

            // Enhanced error handling with recovery attempts
            hls.on(Hls.Events.ERROR, (_event, data) => {
                if (data.fatal) {
                    switch (data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            console.error('Network error, attempting recovery...', data);
                            hls.startLoad();
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            console.error('Media error, attempting recovery...', data);
                            hls.recoverMediaError();
                            break;
                        default:
                            console.error('Fatal error, destroying...', data);
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
