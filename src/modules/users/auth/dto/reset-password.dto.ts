import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordByEmailDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'The reset token received via email',
  })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({
    example: 'newPassword123',
    description: 'The new password for the account',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiProperty({
    example: 'newPassword123',
    description: 'Confirmation of the new password',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  confirmPassword: string;
}
