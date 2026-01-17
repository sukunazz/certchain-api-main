import { IsNotEmpty, IsString } from 'class-validator';

export class SignInWithOrganizationDto {
  @IsString()
  @IsNotEmpty()
  subdomain: string;
}
