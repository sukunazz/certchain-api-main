import { ApiProperty } from '@nestjs/swagger';
import { OrganizerType } from '@prisma/client';
import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateOrganizerDto {
  @ApiProperty({ description: 'Organization logo' })
  @IsOptional()
  @IsString()
  logo?: string;

  @ApiProperty({ description: 'Organization email address' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ description: 'Organization phone number' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: 'Organization type', enum: OrganizerType })
  @IsOptional()
  @IsEnum(OrganizerType)
  type?: OrganizerType;

  @ApiProperty({ description: 'Organization subdomain' })
  @IsOptional()
  @IsString()
  subdomain?: string;

  @ApiProperty({ description: 'Organization name' })
  @IsOptional()
  @IsString()
  name?: string;
}
