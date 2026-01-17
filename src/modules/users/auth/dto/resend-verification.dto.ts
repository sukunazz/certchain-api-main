import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ResendVerificationEmailDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'The email address to resend verification email to',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
