import { ApiProperty } from '@nestjs/swagger';

export class ResponseDto {
  @ApiProperty({ example: 'Operation successful' })
  message: string;

  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({
    example: {
      total: 100,
      page: 1,
      perPage: 10,
    },
    nullable: true,
  })
  meta:
    | Record<string, any>
    | {
        total: number;
        page: number;
        perPage: number;
      };
}
