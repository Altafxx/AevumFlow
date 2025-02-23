import * as Minio from 'minio'
// const Minio = require('minio');

export const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT || "localhost",
    port: process.env.MINIO_PORT ? parseInt(process.env.MINIO_PORT) : parseInt("9000"),
    useSSL: process.env.MINIO_USE_SSL === "true",
    accessKey: process.env.MINIO_ACCESS_KEY || "minioadmin",
    secretKey: process.env.MINIO_SECRET_KEY || "minioadmin",
});