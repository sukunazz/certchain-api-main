import { ApiProperty } from '@nestjs/swagger';

export class ImageUploadDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: Express.Multer.File;
}

export class ImagesUploadDto {
  @ApiProperty({ type: 'array', items: { type: 'string', format: 'binary' } })
  files: Express.Multer.File[];
}
