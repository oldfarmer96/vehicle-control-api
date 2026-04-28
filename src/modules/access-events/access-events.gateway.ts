import { Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PayloadI } from './interfaces/payloadEvent.interface';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: 'access-control',
})
export class AccessEventsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(AccessEventsGateway.name);

  @WebSocketServer()
  server!: Server;

  afterInit() {
    this.logger.log(
      'Servidor WebSocket inicializado y escuchando en el namespace: /access-control',
    );
  }

  handleConnection(client: Socket) {
    this.logger.log(`Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Cliente desconectado: ${client.id}`);
  }

  notifyNewEvent(payload: PayloadI) {
    this.logger.log(
      `Emitiendo nuevo evento de acceso: ${payload.vehiculo.placa}`,
    );

    this.server.emit('new-access-event', payload);
  }
}
