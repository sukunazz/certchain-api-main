import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { BadRequestException, Injectable } from '@nestjs/common';
import { lookup } from 'mime-types';
import { slugify } from '../utils/slugify';

export const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.S3_URL,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
  },
  forcePathStyle: true,
});

const headers: Record<string, string> = {
  'x-amz-checksum-algorithm': '"CRC32"',
};

s3Client.middlewareStack.add(
  (next) =>
    async (args): Promise<any> => {
      const request = args.request as RequestInit;

      Object.entries(headers).forEach(
        ([key, value]: [string, string]): void => {
          if (!request.headers) {
            request.headers = {};
          }
          (request.headers as Record<string, string>)[key] = value;
        },
      );

      return next(args);
    },
  { step: 'build', name: 'customHeaders' },
);

const bucket = process.env.S3_BUCKET;

@Injectable()
export class S3Service {
  constructor() {}
  async uploadPublicFile(
    file: Express.Multer.File,
    options: {
      key: string;
    },
  ) {
    try {
      const key = options.key || file.originalname;

      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: file.buffer,
        ContentType: lookup(file.originalname) || 'application/octet-stream',
        ACL: 'public-read',
      });

      const r = await s3Client.send(command);
      console.log('rrrr in upload', r);

      return key;
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }

  async publicUploader(
    folder: string,
    title: string,
    file: Express.Multer.File,
  ) {
    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;
    const randomHash = Math.random().toString(36).substring(2, 15);
    const key = `assets/${year}/${month}/${randomHash}`;
    const fileUrl = await this.uploadPublicFile(file, {
      key,
    });

    return fileUrl;
  }

  generateUniqueKey(slug: string, image: Express.Multer.File) {
    const extension = image.originalname.split('.').pop();
    const fullNameOnly = image.originalname.split('.').slice(0, -1).join('.');
    return slugify(`${slug}-${Date.now()}.${fullNameOnly}`) + '.' + extension;
  }

  async deletePublicFile(key: string) {
    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    });
    await s3Client.send(command);
    return true;
  }
}
