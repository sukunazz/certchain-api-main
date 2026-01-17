import { Module } from '@nestjs/common';
import { DbModule } from '../db/db.module';
import { S3Module } from '../s3/s3.module';
import { ImageController } from './image.controller';
import { ImageService } from './image.service';

@Module({
  providers: [ImageService],
  exports: [ImageService],
  controllers: [ImageController],
  imports: [DbModule, S3Module],
})
export class ImageModule {}
