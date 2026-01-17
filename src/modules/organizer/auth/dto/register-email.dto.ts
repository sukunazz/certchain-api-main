import { ApiProperty } from '@nestjs/swagger';
import { OrganizerType } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class RegisterEmailDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({
    message: 'The name field is required',
  })
  name: string;

  @ApiProperty()
  @IsEmail(
    {},
    {
      message: 'The email field must be a valid email address',
    },
  )
  @IsNotEmpty({
    message: 'The email field is required',
  })
  organizationContactEmail: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({
    message: 'The organization name field is required',
  })
  organizationName: string;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty({
    message: 'The email field is required',
  })
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(10, {
    message: 'The phone field must be at least 10 characters long',
  })
  phone: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(8, {
    message: 'The password field must be at least 8 characters long',
  })
  password: string;

  @ApiProperty({ enum: OrganizerType })
  @IsEnum(OrganizerType, {
    message: 'The type field must be a valid organizer type',
  })
  @IsNotEmpty({
    message: 'The type field is required',
  })
  type: OrganizerType;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({
    message: 'The subdomain field is required',
  })
  @Matches(/^[a-z0-9-]+$/, {
    message:
      'The subdomain field can only contain lowercase letters, numbers and hyphens',
  })
  @MinLength(3, {
    message: 'The subdomain field must be at least 3 characters long',
  })
  subdomain: string;
}
