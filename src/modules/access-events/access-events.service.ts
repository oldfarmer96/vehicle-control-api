import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
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
import { toDate } from 'date-fns-tz';
import { subDays } from 'date-fns';

const TIMEZONE = 'America/Lima';

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
    let vehiculo = await this.prisma.vehiculo.findUnique({
      where: { placa: dto.placa },
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

    if (!vehiculo) {
      this.logger.log(
        `Placa ${dto.placa} no encontrada localmente. Consultando API`,
      );
      vehiculo = await this.fetchExternalVehicleData(dto.placa);
    }

    try {
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

      this.gateway.notifyNewEvent({
        ...nuevoEvento,
        confianzaOcr: nuevoEvento.confianzaOcr?.toNumber(),
      });

      return {
        ...nuevoEvento,
        confianzaOcr: nuevoEvento.confianzaOcr?.toNumber(),
      };
    } catch (error) {
      this.logger.error('Error al intentar registrar el evento', error);
      throw new InternalServerErrorException('Ocurrio un error interno');
    }
  }

  private async fetchExternalVehicleData(placa: string) {
    const apiToken = this.configService.getOrThrow<string>('TOKEN_JSON_API');
    const urlApi = this.configService.getOrThrow<string>('URL_PLACA_API');

    try {
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

  // WARN: probar funcion
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
      let start: Date;
      let end: Date;

      if (startDate) {
        start = toDate(`${startDate}T00:00:00`, { timeZone: TIMEZONE });
      } else {
        start = subDays(new Date(), 30);
      }

      if (endDate) {
        end = toDate(`${endDate}T23:59:59.999`, { timeZone: TIMEZONE });
      } else {
        end = new Date();
      }

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
