const defaultConfig = () => ({
    // Minio Configuration
    minio: {
        endPoint: process.env.MINIO_ENDPOINT || "localhost",
        port: process.env.MINIO_PORT ? parseInt(process.env.MINIO_PORT) : 9000,
        useSSL: process.env.MINIO_USE_SSL === "true",
        accessKey: process.env.MINIO_ACCESS_KEY || "root",
        secretKey: process.env.MINIO_SECRET_KEY || "password",
        consolePort: process.env.MINIO_CONSOLE_PORT || "9001",
        imageUrl: process.env.MINIO_ENDPOINT ?
            `http${process.env.MINIO_USE_SSL ? "s" : ""}://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/thumbnails` :
            "http://minio:9000/thumbnails/**"
    },

    // Auth Configuration
    auth: {
        nextAuthUrl: process.env.NEXTAUTH_URL || "http://localhost:3000",
        nextAuthSecret: process.env.NEXTAUTH_SECRET || "",
        githubId: process.env.GITHUB_ID || "",
        githubSecret: process.env.GITHUB_SECRET || ""
    },

    // Database Configuration
    database: {
        url: process.env.DATABASE_URL || ""
    },

    // System Configuration
    system: {
        usingArm: process.env.USING_ARM === "true"
    },

    // Security Configuration
    security: {
        allowedOrigins: (process.env.ALLOWED_ORIGINS || "").split(",").filter(origin => origin.trim() !== ""),
        allowedRemoteImages: (process.env.ALLOWED_REMOTE_IMAGES || "").split(",").filter(url => url.trim() !== "")
    }
});

export default defaultConfig;
