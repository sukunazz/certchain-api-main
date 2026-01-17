import { IsNotEmpty, IsString } from 'class-validator';

export class MessageDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsNotEmpty()
  conversationId: string;

  @IsString()
  @IsNotEmpty()
  senderId: string;
}
