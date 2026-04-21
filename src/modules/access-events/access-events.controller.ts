import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { AccessEventsService } from './access-events.service';
import { ApiKeyGuard } from '@src/common/guards/api-key.guard';
import { ReceiveEventDto } from './dto/receive-event.dto';
import { FindAccessEventsQryDto } from './dto/find-access-events-qry.dto';

@Controller('access-events')
export class AccessEventsController {
  constructor(private readonly accessEventsService: AccessEventsService) {}

  @Get()
  async getAllEvents(@Query() qry: FindAccessEventsQryDto) {
    return this.accessEventsService.getAllEvents(qry);
  }

  @Get('recent')
  async getRecent() {
    return this.accessEventsService.getRecentEvents();
  }

  @Post()
  @UseGuards(ApiKeyGuard)
  async receiveEvent(@Body() data: ReceiveEventDto) {
    return this.accessEventsService.handleWebhook(data);
  }
}
