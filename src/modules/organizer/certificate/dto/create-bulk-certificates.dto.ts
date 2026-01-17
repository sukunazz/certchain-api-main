import { IsArray, IsString } from 'class-validator';

export class CreateBulkCertificatesDto {
  @IsArray()
  @IsString({ each: true })
  userIds: string[];
}
