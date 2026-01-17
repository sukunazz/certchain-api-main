import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    example: 'John',
    description: 'The first name of the user',
    required: false,
  })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({
    example: 'Doe',
    description: 'The last name of the user',
    required: false,
  })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty({
    example: '+1234567890',
    description: 'The phone number of the user',
    required: false,
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({
    example: 'newPassword123',
    description: 'The password of the user',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MinLength(8)
  password?: string;

  @ApiProperty({
    example: true,
    description: 'Whether the user is verified',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isVerified?: boolean;

  @ApiProperty({
    example: 'token123',
    description: 'The verification token',
    required: false,
  })
  @IsString()
  @IsOptional()
  verificationToken?: string;

  @ApiProperty({
    example: 'token123',
    description: 'The reset password token',
    required: false,
  })
  @IsString()
  @IsOptional()
  resetPasswordToken?: string;
}
