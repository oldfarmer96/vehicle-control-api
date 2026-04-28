import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { AccessEventsService } from './access-events.service';
import { ReceiveEventDto } from './dto/receive-event.dto';
import { FindAccessEventsQryDto } from './dto/find-access-events-qry.dto';
import { ApiKeyGuard } from '@/common/guards/api-key.guard';
import { Auth } from '@/common/decorators/auth.decorator';
import { RolWeb } from '@/generated/prisma/enums';

@Controller('access-events')
export class AccessEventsController {
  constructor(private readonly accessEventsService: AccessEventsService) {}

  @Get()
  @Auth(RolWeb.ADMINISTRADOR, RolWeb.CONSULTOR)
  getAllEvents(@Query() qry: FindAccessEventsQryDto) {
    return this.accessEventsService.getAllEvents(qry);
  }

  @Get('recent')
  @Auth(RolWeb.ADMINISTRADOR, RolWeb.CONSULTOR)
  getRecent() {
    return this.accessEventsService.getRecentEvents();
  }

  @Post()
  @UseGuards(ApiKeyGuard)
  receiveEvent(@Body() data: ReceiveEventDto) {
    return this.accessEventsService.handleWebhook(data);
  }
}
