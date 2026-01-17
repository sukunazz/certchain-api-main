import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class JoinEventDto {
  @IsNotEmpty()
  @IsString()
  eventId: string;

  @IsOptional()
  @IsString()
  paymentMethod?: string;
}
