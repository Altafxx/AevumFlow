import { RemotePattern } from "next/dist/shared/lib/image-config";

const defaultRemoteImages = [
    {
        protocol: "http",
        hostname: "localhost",
        port: "9000",
        pathname: "/thumbnails/**",
    },
    {
        protocol: "http",
        hostname: "minio",
        port: "9000",
        pathname: "/thumbnails/**",
    }
] satisfies RemotePattern[];

export default function allowedRemotePattern(): RemotePattern[] {
    const allowRemoteImagesEnv = process.env.ALLOWED_REMOTE_IMAGES || "";
    const allowRemoteImagesArray = allowRemoteImagesEnv.split(",").filter(url => url.trim() !== "");

    const allowRemoteImagesURL = () => {
        if (allowRemoteImagesArray.length === 0) return null;

        return allowRemoteImagesArray.map((remoteImage: string) => {
            try {
                const url = new URL(remoteImage.trim());
                const pattern: RemotePattern = {
                    protocol: url.protocol.replace(":", "") === "https" ? "https" : "http",
                    hostname: url.hostname,
                    port: url.port,
                    pathname: url.pathname.charAt(-1) === "/" || url.pathname === "/" ? url.pathname + "**" : url.pathname + "/**"
                };
                return pattern;
                /* eslint-disable @typescript-eslint/no-unused-vars */
            } catch (_) {
                console.warn(`Invalid URL: ${remoteImage}`);
                return null;
            }
        }).filter((pattern): pattern is RemotePattern => pattern !== null);
    };

    return [
        ...defaultRemoteImages,
        ...(allowRemoteImagesURL() || [])
    ];
}