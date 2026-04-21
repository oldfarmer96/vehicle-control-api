import { Module } from '@nestjs/common';
import { AccessEventsController } from './access-events.controller';
import { AccessEventsService } from './access-events.service';
import { HttpModule } from '@nestjs/axios';
import { AccessEventsGateway } from './access-events.gateway';

@Module({
  imports: [HttpModule],
  controllers: [AccessEventsController],
  providers: [AccessEventsService, AccessEventsGateway],
})
export class AccessEventsModule {}
