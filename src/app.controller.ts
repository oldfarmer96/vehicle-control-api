import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/')
  main() {
    return {
      appName: 'Vehicle control api',
    };
  }

  @Get('health')
  health() {
    return this.appService.health();
  }
}
