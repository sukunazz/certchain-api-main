import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgotPasswordByEmailDto {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
