import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AppLoginDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'The subdomain of the organizer',
  })
  organizerSubDomain: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'The email of the team member',
  })
  email: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'The password of the team member',
  })
  password: string;
}
