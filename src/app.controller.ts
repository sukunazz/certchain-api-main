import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('certificates/:id')
  async getCertificate(@Param('id') id: string) {
    const certificate = await this.appService.getCertificate(id);
    return {
      data: certificate,
    };
  }

  @Get()
  getHello(): { data: string } {
    return {
      data: 'Hello World',
    };
  }
}
