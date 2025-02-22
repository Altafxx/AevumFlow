"use server"

import { minioClient } from "@/lib/minio-client";

const policy = {
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "AWS": ["*"]
            },
            "Action": [
                "s3:GetBucketLocation",
                "s3:ListBucket"
            ],
            "Resource": ["arn:aws:s3:::thumbnails"]
        },
        {
            "Effect": "Allow",
            "Principal": {
                "AWS": ["*"]
            },
            "Action": ["s3:GetObject"],
            "Resource": ["arn:aws:s3:::thumbnails/*"]
        }
    ]
}

export async function initializeMinio() {
    try {
        const exists = await minioClient.bucketExists("thumbnails");
        if (!exists) {
            await minioClient.makeBucket("thumbnails");
            await minioClient.setBucketPolicy("thumbnails", JSON.stringify(policy));
            console.log("Bucket created successfully");
        }

        if (await minioClient.getBucketPolicy("thumbnails")) {
            console.log(await minioClient.getBucketPolicy("thumbnails"));
            console.log("Policy set successfully");
        }

    } catch (err) {
        console.log(err);
    }
}