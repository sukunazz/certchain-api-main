import { Module } from '@nestjs/common';
import { EsewaService } from './esewa.service';

@Module({
  providers: [EsewaService]
})
export class EsewaModule {}
