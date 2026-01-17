import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SendMessageDto {
  @ApiProperty({
    description: 'Message content',
    example: 'Hello, how are you?',
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}
