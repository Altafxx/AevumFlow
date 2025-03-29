"use client"
import { useEffect, useRef } from 'react';
import Hls from 'hls.js';
import Plyr from 'plyr';
import 'plyr/dist/plyr.css';

const defaultHlsConfig = {
    // Core settings
    enableWorker: true,
    lowLatencyMode: false,

    // Buffer settings - optimized for high-res
    maxBufferSize: 512 * 1000 * 1000,    // 512MB - reduced to prevent browser memory issues
    maxBufferLength: 60,                  // 60 seconds
    maxMaxBufferLength: 120,              // Maximum buffer size in seconds

    // Loading settings
    manifestLoadingMaxRetry: 6,
    manifestLoadingRetryDelay: 1000,
    manifestLoadingTimeOut: 20000,

    // Fragment loading
    fragLoadingMaxRetry: 6,
    fragLoadingRetryDelay: 1000,
    fragLoadingTimeOut: 20000,

    // ABR (Adaptive Bitrate) settings
    startLevel: -1,                       // Auto
    abrEwmaDefaultEstimate: 5000000,      // 5mbps starting bandwidth estimate
    abrBandWidthFactor: 0.95,
    abrBandWidthUpFactor: 0.7,
    abrMaxWithRealBitrate: true,

    // Performance settings
    testBandwidth: true,
    progressive: false,                   // Disable progressive download
    backBufferLength: 30,                 // Reduce back buffer to save memory
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

        // Add debug logging
        console.log('Video source:', secureUrl);
        console.log('Available resolutions:', availableResolutions);

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
                },
                // Level capping and quality settings
                capLevelToPlayerSize: true,
                startLevel: -1,  // Auto
                // Adaptive bitrate settings
                abrEwmaDefaultEstimate: 5000000, // 5mbps starting bandwidth estimate
                abrBandWidthFactor: 0.95,
                abrBandWidthUpFactor: 0.7,
                abrMaxWithRealBitrate: true
            });
            hlsRef.current = hls;

            // Add level switching logic
            hls.on(Hls.Events.LEVEL_SWITCHED, (_event, data) => {
                console.log('Quality Level switched to:', data.level);
            });

            // Add manual quality selection
            hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
                console.log('Available qualities:', data.levels.map(level => level.height));
                // Start with a lower quality and let it adapt
                const initialLevel = Math.min(2, data.levels.length - 1);
                hls.nextLevel = initialLevel; // Use nextLevel instead of currentLevel for smoother switching
            });

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

            // Create custom control for current resolution
            const currentResolutionControl = document.createElement('span');
            currentResolutionControl.className = 'plyr__controls__item plyr__control--resolution';
            currentResolutionControl.style.minWidth = '60px';
            currentResolutionControl.style.padding = '0 10px';
            currentResolutionControl.textContent = 'Auto';

            // Update resolution text when quality changes
            hls.on(Hls.Events.LEVEL_SWITCHED, (_event, data) => {
                const currentLevel = hls.levels[data.level];
                if (currentResolutionControl) {
                    currentResolutionControl.textContent = currentLevel ? `${currentLevel.height}p` : 'Auto';
                }
            });

            const player = new Plyr(video, {
                controls: [
                    'play-large',
                    'play',
                    'progress',
                    'current-time',
                    'duration',
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

            // Add custom styles to document
            const style = document.createElement('style');
            style.textContent = `
                .plyr__control--resolution {
                    display: inline-flex !important;
                    align-items: center;
                    justify-content: center;
                    padding: 0 10px;
                    font-size: 13px;
                    color: rgba(255, 255, 255, 0.8);
                    font-weight: 400;
                    border-left: 1px solid rgba(255, 255, 255, 0.2);
                }
            `;
            document.head.appendChild(style);

            // Wait for player to be ready before adding the custom control
            player.on('ready', () => {
                const controlBar = video.closest('.plyr')?.querySelector('.plyr__controls');
                if (controlBar) {
                    const durationContainer = controlBar.querySelector('.plyr__time--duration');
                    const muteButton = controlBar.querySelector('.plyr__control[data-plyr="mute"]');

                    if (durationContainer && muteButton) {
                        // Insert after duration and before mute
                        muteButton.parentNode?.insertBefore(currentResolutionControl, muteButton);
                    }
                }

                // Set initial resolution
                const currentLevel = hls.currentLevel >= 0 ? hls.levels[hls.currentLevel] : null;
                currentResolutionControl.textContent = currentLevel ? `${currentLevel.height}p` : 'Auto';
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
                style={{
                    transform: 'translateZ(0)',  // Force hardware acceleration
                    willChange: 'transform'      // Hint for browser optimization
                }}
            />
        </div>
    );
}
