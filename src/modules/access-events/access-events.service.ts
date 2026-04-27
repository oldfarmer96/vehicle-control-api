import { Injectable, Logger } from '@nestjs/common';
import { AccessEventsGateway } from './access-events.gateway';
import { HttpService } from '@nestjs/axios';
import { ReceiveEventDto } from './dto/receive-event.dto';
import { FindAccessEventsQryDto } from './dto/find-access-events-qry.dto';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { PrismaService } from '@/core/prisma/prisma.service';
import { TipoEventoAcceso } from '@/generated/prisma/enums';
import { Prisma } from '@/generated/prisma/client';

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

  async getAllEvents(qry: FindAccessEventsQryDto) {
    const {
      page = 1,
      limit = 10,
      search,
      startDate,
      endDate,
      tipoEvento,
    } = qry;
    const skip = (page - 1) * limit;

    const where: Prisma.EventoAccesoWhereInput = {};

    if (search) {
      where.vehiculo = { placa: { contains: search, mode: 'insensitive' } };
    }

    if (tipoEvento) {
      where.tipoEvento = tipoEvento;
    }

    if (startDate || endDate) {
      const PET_OFFSET_HOURS = 5;
      const now = new Date();

      const start = startDate
        ? new Date(
            new Date(startDate).getTime() + PET_OFFSET_HOURS * 60 * 60 * 1000,
          )
        : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const end = endDate
        ? new Date(
            new Date(endDate).getTime() +
              PET_OFFSET_HOURS * 60 * 60 * 1000 +
              24 * 60 * 60 * 1000 -
              1,
          )
        : new Date(now.getTime() + PET_OFFSET_HOURS * 60 * 60 * 1000);

      where.fechaHora = {
        gte: start,
        lte: end,
      };
    }

    const [total, events] = await Promise.all([
      this.prisma.eventoAcceso.count({ where }),
      this.prisma.eventoAcceso.findMany({
        where,
        skip,
        take: limit,
        orderBy: { fechaHora: 'desc' },
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
      }),
    ]);

    const lastPage = Math.ceil(total / limit);

    return {
      data: events,
      meta: {
        total,
        isEmpty: total === 0,
        page,
        limit,
        lastPage,
        hasNext: page < lastPage,
        hasPrev: page > 1,
        nextPage: page < lastPage ? page + 1 : null,
        prevPage: page > 1 ? page - 1 : null,
      },
    };
  }

  async getRecentEvents() {
    // Traer las últimas 15 entradas
    const entradas = await this.prisma.eventoAcceso.findMany({
      where: { tipoEvento: 'ENTRADA' },
      orderBy: { fechaHora: 'desc' },
      take: 5,
      include: {
        vehiculo: {
          select: {
            placa: true,
            marca: true,
            modelo: true,
            color: true,
            personas: { include: { persona: true } },
          },
        },
      },
    });

    // Traer las últimas 15 salidas
    const salidas = await this.prisma.eventoAcceso.findMany({
      where: { tipoEvento: 'SALIDA' },
      orderBy: { fechaHora: 'desc' },
      take: 5,
      include: {
        vehiculo: {
          select: {
            placa: true,
            marca: true,
            modelo: true,
            color: true,
            personas: { include: { persona: true } },
          },
        },
      },
    });

    return {
      entrada: entradas,
      salida: salidas,
    };
  }
}
