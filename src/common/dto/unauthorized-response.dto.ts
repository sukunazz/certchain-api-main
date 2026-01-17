import { ApiProperty } from '@nestjs/swagger';

export class UnauthorizedResponseDto {
  @ApiProperty({ example: null, nullable: true })
  data: any;
  //   data: any;

  @ApiProperty({ example: 'Unauthorized' })
  errors: any;

  @ApiProperty({ example: 'Unauthorized' })
  message: string;

  @ApiProperty({ example: 401 })
  statusCode: number;
}
