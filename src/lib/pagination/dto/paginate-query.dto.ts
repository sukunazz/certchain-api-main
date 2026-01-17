import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class PaginateQueryDto {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  page?: number;

  @ApiProperty({
    required: false,
  })
  @IsString()
  @IsOptional()
  limit?: number;

  @ApiProperty({
    required: false,
    example: 'createdAt:desc',
  })
  @IsOptional()
  @IsString()
  sort?: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  searchFields?: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  include?: string;
}
