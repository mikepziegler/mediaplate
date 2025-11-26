// src/storage/object-storage.service.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
    S3Client,
    HeadBucketCommand,
    CreateBucketCommand,
    ListObjectsV2Command,
    PutObjectCommand,
    DeleteObjectCommand,
    GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
    StorageGalleryInterface,
    StorageObjectInterface,
    StorageProvider,
} from '@mediaplate/util';

@Injectable()
export class ObjectStorageService implements OnModuleInit {
    private readonly logger = new Logger(ObjectStorageService.name);

    private readonly provider: StorageProvider =
        (process.env.STORAGE_PROVIDER as StorageProvider) || 'minio';

    private readonly bucketName = process.env.STORAGE_BUCKET_NAME || 'gallery';

    private s3: S3Client;

    constructor() {
        if (this.provider === 'minio') {

            const url = process.env.MINIO_URL;
            if (!url) {
                throw new Error(
                    `MINIO_URL is required when STORAGE_PROVIDER=minio`
                );
            }

            const accessKeyId = process.env.MINIO_ACCESS_KEY || 'minioadmin';
            const secretAccessKey = process.env.MINIO_SECRET_KEY || 'minioadmin';

            this.s3 = new S3Client({
                region: 'us-east-1', // MinIO accepts anything
                endpoint: url,       // ← FULL URL now!
                forcePathStyle: true,
                credentials: { accessKeyId, secretAccessKey },
            });

            this.logger.log(`MinIO S3 client initialized at ${url}`);

        } else if (this.provider === 's3') {
            // ----------------------------------------
            // 🟡 AWS S3
            // ----------------------------------------
            this.s3 = new S3Client({
                region: process.env.AWS_REGION || 'eu-central-1',
            });

            this.logger.log(`AWS S3 client initialized`);

        } else if (this.provider === 'r2') {
            // ----------------------------------------
            // 🔵 Cloudflare R2
            // ----------------------------------------
            const endpoint = process.env.R2_ENDPOINT;
            if (!endpoint) throw new Error(`R2_ENDPOINT missing`);

            this.s3 = new S3Client({
                region: 'auto',
                endpoint,
                forcePathStyle: true,
                credentials: {
                    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
                    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
                },
            });

            this.logger.log(`Cloudflare R2 client initialized at ${endpoint}`);
        }
    }

    async onModuleInit() {
        try {
            await this.s3.send(
                new HeadBucketCommand({ Bucket: this.bucketName }),
            );
            this.logger.log(`Bucket "${this.bucketName}" exists.`);
        } catch {
            this.logger.warn(`Bucket missing, attempting creation...`);
            try {
                await this.s3.send(
                    new CreateBucketCommand({ Bucket: this.bucketName }),
                );
                this.logger.log(`Bucket created.`);
            } catch (err) {
                this.logger.error(`Bucket creation failed`, err);
            }
        }
    }

    // --- SAME upload / delete / presign / listing methods as before ---
    async uploadObject(key: string, body: Buffer, mime: string) {
        await this.s3.send(
            new PutObjectCommand({
                Bucket: this.bucketName,
                Key: key,
                Body: body,
                ContentType: mime,
            }),
        );
    }

    async removeObject(key: string) {
        await this.s3.send(
            new DeleteObjectCommand({
                Bucket: this.bucketName,
                Key: key,
            }),
        );
    }

    async getPresignedUrl(key: string): Promise<string> {
        return getSignedUrl(
            this.s3,
            new GetObjectCommand({ Bucket: this.bucketName, Key: key }),
            { expiresIn: 3600 },
        );
    }

    async listGalleries(): Promise<StorageGalleryInterface[]> {
        const objects = await this.listObjectsRaw('');

        const map = new Map<string, { firstObjectName: string; imageCount: number }>();

        for (const obj of objects) {
            const parts = obj.name.split('/');
            if (parts.length < 2) continue;

            const galleryName = parts[0];

            if (!map.has(galleryName)) {
                map.set(galleryName, { firstObjectName: obj.name, imageCount: 1 });
            } else {
                map.get(galleryName)!.imageCount += 1;
            }
        }

        const galleries: StorageGalleryInterface[] = [];

        for (const [name, data] of map.entries()) {
            let coverUrl: string | undefined;
            try {
                coverUrl = await this.getPresignedUrl(data.firstObjectName); // ⬅ presigned cover
            } catch {
                coverUrl = undefined;
            }

            galleries.push({
                name,
                coverUrl,
                imageCount: data.imageCount,
            });
        }

        galleries.sort((a, b) => a.name.localeCompare(b.name));
        return galleries;
    }

    async listObjectsInGallery(galleryName: string): Promise<StorageObjectInterface[]> {
        const prefix = `${galleryName}/`;
        const objects = await this.listObjectsRaw(prefix);

        const result: StorageObjectInterface[] = [];

        for (const obj of objects) {
            const url = await this.getPresignedUrl(obj.name); // ⬅ generate presigned URL here

            result.push({
                name: obj.name,
                size: obj.size,
                lastModified: obj.lastModified,
                url,
            });
        }

        return result;
    }

    private async listObjectsRaw(prefix = '') {
        const items: any[] = [];
        let ContinuationToken;

        do {
            const res = await this.s3.send(
                new ListObjectsV2Command({
                    Bucket: this.bucketName,
                    Prefix: prefix || undefined,
                    ContinuationToken,
                }),
            );

            (res.Contents || []).forEach(obj => {
                items.push({
                    name: obj.Key!,
                    size: obj.Size!,
                    lastModified: obj.LastModified!,
                });
            });

            ContinuationToken = res.IsTruncated ? res.NextContinuationToken : undefined;
        } while (ContinuationToken);

        return items;
    }
}
