import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AccessEventsService } from './access-events.service';
import { ApiKeyGuard } from '@src/common/guards/api-key.guard';
import { ReceiveEventDto } from './dto/receive-event.dto';

@Controller('access-events')
export class AccessEventsController {
  constructor(private readonly accessEventsService: AccessEventsService) {}

  @Post()
  @UseGuards(ApiKeyGuard)
  async receiveEvent(@Body() data: ReceiveEventDto) {
    return this.accessEventsService.handleWebhook(data);
  }
}
