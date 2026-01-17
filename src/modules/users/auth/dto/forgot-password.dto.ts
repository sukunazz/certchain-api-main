import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgotPasswordByEmailDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'The email address of the account to reset password for',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
