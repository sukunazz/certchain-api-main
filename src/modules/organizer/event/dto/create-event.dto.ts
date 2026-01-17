import { ApiProperty } from '@nestjs/swagger';
import { EventType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  ValidateNested,
} from 'class-validator';

export class EventScheduleDto {
  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  date: Date;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description?: string;
}

export class EventFaqDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  question: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  answer: string;
}

export class CreateEventDto {
  @ApiProperty()
  @IsString()
  @Matches(/^[a-z0-9-]+$/, {
    message:
      'The handle filed must be in lowercase and can only contain letters, numbers, and hyphens.',
  })
  handle: string;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsDateString()
  startDate: Date;

  @ApiProperty()
  @IsDateString()
  endDate: Date;

  @ApiProperty()
  @IsString()
  banner: string;

  @ApiProperty()
  @IsEnum(EventType)
  type: EventType;

  @ApiProperty()
  @IsBoolean()
  isPaid: boolean;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  cost?: number;

  @ApiProperty({ type: [EventScheduleDto] })
  @IsArray()
  @ValidateNested()
  @Type(() => EventScheduleDto)
  schedules: EventScheduleDto[];

  @ApiProperty({ type: [EventFaqDto] })
  @IsArray()
  @ValidateNested()
  @Type(() => EventFaqDto)
  faqs: EventFaqDto[];

  @ApiProperty()
  @IsString()
  @IsOptional()
  link?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  password?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  city?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  state?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  country?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  pincode?: string;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;
}
