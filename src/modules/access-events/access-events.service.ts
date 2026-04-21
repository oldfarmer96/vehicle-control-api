import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@src/core/prisma/prisma.service';
import { AccessEventsGateway } from './access-events.gateway';
import { HttpService } from '@nestjs/axios';
import { ReceiveEventDto } from './dto/receive-event.dto';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { TipoEventoAcceso } from '@src/generated/prisma/enums';

@Injectable()
export class AccessEventsService {
  private readonly logger = new Logger(AccessEventsService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
    private readonly gateway: AccessEventsGateway,
    private readonly configService: ConfigService,
  ) {}

  async handleWebhook(dto: ReceiveEventDto) {
    // const { placa, evento, confianzaOcr, puntoControl } = data;

    // 1. Resolver el Vehículo (Local o API Externa)
    // En el findUnique del handleWebhook
    let vehiculo = await this.prisma.vehiculo.findUnique({
      where: { placa: dto.placa },
      select: {
        id: true, // ← agregar esto
        personas: { include: { persona: true } },
        placa: true,
        marca: true,
        modelo: true,
        color: true,
        vin: true,
        motor: true,
      },
    });

    if (!vehiculo) {
      this.logger.log(
        `Placa ${dto.placa} no encontrada localmente. Consultando API externa...`,
      );
      vehiculo = await this.fetchExternalVehicleData(dto.placa);
    }

    // 2. Registrar el Evento de Acceso en la BD
    const nuevoEvento = await this.prisma.eventoAcceso.create({
      data: {
        vehiculoId: vehiculo.id,
        tipoEvento:
          dto.evento === 'ENTRADA'
            ? TipoEventoAcceso.ENTRADA
            : TipoEventoAcceso.SALIDA,
        puntoControl: dto.puntoControl,
        confianzaOcr: dto.confianzaOcr,
      },
      include: {
        vehiculo: {
          select: {
            placa: true,
            marca: true,
            modelo: true,
            color: true,
            personas: {
              include: {
                persona: { select: { nombreCompleto: true, rol: true } },
              },
            },
          },
        },
      },
    });

    // 3. Notificar al Dashboard mediante WebSocket
    this.gateway.notifyNewEvent(nuevoEvento);

    return nuevoEvento;
  }

  private async fetchExternalVehicleData(placa: string) {
    try {
      const apiToken = this.configService.getOrThrow<string>('TOKEN_JSON_API');
      const urlApi = this.configService.getOrThrow<string>('URL_PLACA_API');

      const response = await firstValueFrom(
        this.httpService.post(
          urlApi,
          { placa },
          { headers: { Authorization: `Bearer ${apiToken}` } },
        ),
      );

      if (response.data.success) {
        const { data } = response.data;
        const newVehicle = await this.prisma.vehiculo.create({
          data: {
            placa: data.placa,
            marca: data.marca,
            modelo: data.modelo,
            color: data.color,
            vin: data.vin,
            motor: data.motor,
          },
          // ← agregar select con personas vacías
          select: {
            id: true,
            personas: { include: { persona: true } },
            placa: true,
            marca: true,
            modelo: true,
            color: true,
            vin: true,
            motor: true,
          },
        });

        return newVehicle;
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        this.logger.error(
          `Fallo al consultar API externa para placa ${placa}: ${error.response?.data.message}`,
        );
      } else {
        this.logger.error(`Fallo al consultar API externa para placa ${placa}`);
      }
    }

    // vehiculo fantasma también con select consistente
    const vehiculoFantasma = await this.prisma.vehiculo.create({
      data: { placa, marca: 'DESCONOCIDO' },
      select: {
        id: true,
        personas: { include: { persona: true } },
        placa: true,
        marca: true,
        modelo: true,
        color: true,
        vin: true,
        motor: true,
      },
    });

    return vehiculoFantasma;
  }
}
