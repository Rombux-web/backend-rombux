import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello() {
    return { message: '¡Bienvenido a la API de ROMBUX!' };
  }

  @Get('api/health')
  healthCheck() {
    return { status: 'ok', timestamp: new Date() };
  }
}
