import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { S3Service } from '../s3/s3.service';

@Injectable()
export class ImageService {
  constructor(
    private readonly db: DbService,
    private readonly storage: S3Service,
  ) {}

  async uploadImage(folder: string, name: string, file: Express.Multer.File) {
    if (!file)
      return {
        id: null,
        url: null,
      };
    const imageKey = await this.storage.publicUploader(folder, name, file);

    return {
      url: imageKey,
    };
  }

  async uploadImages(folder: string, files: Array<Express.Multer.File>) {
    const images = await Promise.all(
      files.map((file) => this.uploadImage(folder, file.originalname, file)),
    );
    return images;
  }
}
