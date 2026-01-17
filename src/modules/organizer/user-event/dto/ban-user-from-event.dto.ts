import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class BanUserFromEventDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  reason: string;
}
