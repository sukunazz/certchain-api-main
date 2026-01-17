import { ApiProperty } from '@nestjs/swagger';

export class ImageDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  url: string;

  @ApiProperty({ required: false })
  alt?: string;
}
