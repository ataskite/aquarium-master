import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StorageService {
  private readonly bucket: string;
  private readonly publicEndpoint: string;
  private readonly client: S3Client;

  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.bucket = config.get<string>('MINIO_BUCKET') ?? 'aquarium';
    this.publicEndpoint = config.get<string>('MINIO_PUBLIC_ENDPOINT') ?? config.get<string>('MINIO_ENDPOINT') ?? '';
    this.client = new S3Client({
      endpoint: config.get<string>('MINIO_ENDPOINT'),
      region: config.get<string>('MINIO_REGION') ?? 'us-east-1',
      forcePathStyle: true,
      credentials: {
        accessKeyId: config.get<string>('MINIO_ACCESS_KEY') ?? 'minioadmin',
        secretAccessKey: config.get<string>('MINIO_SECRET_KEY') ?? 'minioadmin',
      },
    });
  }

  async upload(file: Express.Multer.File) {
    const objectKey = `uploads/${Date.now()}-${file.originalname}`;
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: objectKey,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    const url = `${this.publicEndpoint}/${this.bucket}/${objectKey}`;
    return this.prisma.fileObject.create({
      data: { bucket: this.bucket, objectKey, url, mimeType: file.mimetype, size: file.size },
    });
  }
}
