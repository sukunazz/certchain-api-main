import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ResendVerificationEmailDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The email address to send the verification email to',
  })
  email: string;
}
