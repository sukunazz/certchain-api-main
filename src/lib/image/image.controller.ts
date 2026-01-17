import {
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ImageUploadDto } from './dto/image-upload.dto';
import { ImageService } from './image.service';

@Controller('image')
@ApiTags('Image')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload an image' })
  @UseInterceptors(FileInterceptor('file'))
  @ApiBody({ type: ImageUploadDto })
  @ApiConsumes('multipart/form-data')
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const result = await this.imageService.uploadImage(
      'uploads',
      file.originalname,
      file,
    );
    return {
      data: {
        url: result.url,
        id: result.id,
      },
    };
  }

  @Post('uploads')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadFiles(@UploadedFiles() files: Array<Express.Multer.File>) {
    const results = await this.imageService.uploadImages('uploads', files);
    return results.map((result) => ({
      url: result.url,
      status: 'done',
      name: files[0].originalname,
    }));
  }
}
