import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({ example: null, nullable: true })
  data: any;
  //   data: any;

  @ApiProperty({
    example: { email: 'Email is required' },
    description: 'Object containing error details for specific fields',
  })
  errors: Record<string, string>;

  @ApiProperty({ example: 'Validation failed' })
  message: string;

  @ApiProperty({ example: 400 })
  statusCode: number;
}

export class NotFoundResponseDto {
  @ApiProperty({ example: null, nullable: true })
  data: any;
  //   data: any;

  @ApiProperty({
    example: { email: 'The resource was not found' },
    description: 'Object containing error details for specific fields',
  })
  errors: Record<string, string>;

  @ApiProperty({ example: 'Not found' })
  message: string;

  @ApiProperty({ example: 404 })
  statusCode: number;
}
