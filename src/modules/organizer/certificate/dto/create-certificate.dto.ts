import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCertificateDto {
  @IsString()
  @IsNotEmpty()
  eventId: string;

  @IsString()
  @IsNotEmpty()
  userId: string;
}
