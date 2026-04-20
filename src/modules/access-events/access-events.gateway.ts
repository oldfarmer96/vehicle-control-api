import { Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*' }, // Ajustar según tu dominio del frontend
  namespace: 'access-control',
})
export class AccessEventsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger('AccessEventsGateway');
  @WebSocketServer()
  server!: Server;

  // 1. Se ejecuta cuando el servidor de WS se inicia
  afterInit(server: Server) {
    this.logger.log(
      '🚀 Servidor WebSocket inicializado y escuchando en el namespace: /access-control',
    );
  }

  // 2. Se ejecuta cuando un cliente (tu dashboard) se conecta
  handleConnection(client: Socket) {
    this.logger.log(`✅ Cliente conectado: ${client.id}`);
  }

  // 3. Se ejecuta cuando un cliente se desconecta
  handleDisconnect(client: Socket) {
    this.logger.log(`❌ Cliente desconectado: ${client.id}`);
  }

  notifyNewEvent(payload: any) {
    this.logger.log(
      `📡 Emitiendo nuevo evento de acceso: ${payload.vehiculo.placa}`,
    );
    this.server.emit('new-access-event', payload);
  }
}
