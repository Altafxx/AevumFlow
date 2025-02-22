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
    const allowRemoteImagesArray = allowRemoteImagesEnv.split(",") || [];
    const allowRemoteImagesURL = allowRemoteImagesArray.map((remoteImage: string) => {
        const url = new URL(remoteImage)
        return {
            protocol: url.protocol?.replace(":", "") === "https" ? "https" : "http",
            hostname: url.hostname,
            port: url.port,
            pathname: url.pathname.charAt(-1) === "/" || url.pathname === "/" ? url.pathname + "**" : url.pathname + "/**"
        } satisfies RemotePattern;
    })

    return [
        ...defaultRemoteImages,
        ...allowRemoteImagesURL
    ];

}