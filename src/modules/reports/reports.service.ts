import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/prisma/prisma.service';
import { GetSummaryQryDto, GetReportsQryDto, GroupBy } from './dto/get-reports-qry.dto';
import {
  SummaryReportResponse,
  SummaryDataPoint,
  ByRoleReportResponse,
  ByVehicleReportResponse,
  ByVehicleDataPoint,
  EventsReportResponse,
} from './dto/report-response.dto';
import { Prisma } from '@/generated/prisma/client';
import { toDate, format } from 'date-fns-tz';
import {
  startOfHour,
  startOfDay,
  startOfWeek,
  startOfMonth,
  startOfYear,
  subDays,
} from 'date-fns';
import { TipoEventoAcceso, RolUniversitario } from '@/generated/prisma/enums';

const TIMEZONE = 'America/Lima';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummaryEntrada(qry: GetSummaryQryDto): Promise<SummaryReportResponse> {
    return this.getSummaryByTipo(qry, TipoEventoAcceso.ENTRADA);
  }

  async getSummarySalida(qry: GetSummaryQryDto): Promise<SummaryReportResponse> {
    return this.getSummaryByTipo(qry, TipoEventoAcceso.SALIDA);
  }

  private async getSummaryByTipo(
    qry: GetSummaryQryDto,
    tipoEvento: TipoEventoAcceso,
  ): Promise<SummaryReportResponse> {
    const { startDate, endDate, groupBy = GroupBy.DAY } = qry;
    const { start, end, dateFormat, truncateFn } = this.getDateRange(
      startDate,
      endDate,
      groupBy,
    );

    const events = await this.prisma.eventoAcceso.findMany({
      where: {
        fechaHora: { gte: start, lte: end },
        tipoEvento,
      },
      select: { fechaHora: true },
      orderBy: { fechaHora: 'asc' },
    });

    const grouped = this.groupEventsByDate(events, dateFormat, truncateFn);
    const datos: SummaryDataPoint[] = Object.entries(grouped).map(([date, count]) => ({
      date,
      total: count,
    }));

    const totalEventos = datos.reduce((sum, d) => sum + d.total, 0);

    return {
      tipoEvento,
      totalEventos,
      datos,
    };
  }

  async getByRoleEntrada(qry: GetSummaryQryDto): Promise<ByRoleReportResponse> {
    return this.getByRoleByTipo(qry, TipoEventoAcceso.ENTRADA);
  }

  async getByRoleSalida(qry: GetSummaryQryDto): Promise<ByRoleReportResponse> {
    return this.getByRoleByTipo(qry, TipoEventoAcceso.SALIDA);
  }

  private async getByRoleByTipo(
    qry: GetSummaryQryDto,
    tipoEvento: TipoEventoAcceso,
  ): Promise<ByRoleReportResponse> {
    const { startDate, endDate } = qry;
    const { start, end } = this.getDateRange(startDate, endDate, GroupBy.DAY);

    const events = await this.prisma.eventoAcceso.findMany({
      where: {
        fechaHora: { gte: start, lte: end },
        tipoEvento,
      },
      include: {
        vehiculo: {
          include: {
            personas: {
              include: { persona: { select: { rol: true } } },
            },
          },
        },
      },
    });

    const roleMap: Record<string, number> = {};

    for (const event of events) {
      for (const vp of event.vehiculo.personas) {
        const rol = vp.persona.rol;
        roleMap[rol] = (roleMap[rol] || 0) + 1;
      }
    }

    const datos = Object.entries(roleMap).map(([rol, total]) => ({
      rol: rol as RolUniversitario,
      total,
    }));

    const totalEventos = datos.reduce((sum, d) => sum + d.total, 0);

    return {
      tipoEvento,
      datos,
      totalEventos,
    };
  }

  async getByVehicleEntrada(qry: GetSummaryQryDto): Promise<ByVehicleReportResponse> {
    return this.getByVehicleByTipo(qry, TipoEventoAcceso.ENTRADA);
  }

  async getByVehicleSalida(qry: GetSummaryQryDto): Promise<ByVehicleReportResponse> {
    return this.getByVehicleByTipo(qry, TipoEventoAcceso.SALIDA);
  }

  private async getByVehicleByTipo(
    qry: GetSummaryQryDto,
    tipoEvento: TipoEventoAcceso,
  ): Promise<ByVehicleReportResponse> {
    const { startDate, endDate } = qry;
    const { start, end } = this.getDateRange(startDate, endDate, GroupBy.DAY);

    const events = await this.prisma.eventoAcceso.findMany({
      where: {
        fechaHora: { gte: start, lte: end },
        tipoEvento,
      },
      include: {
        vehiculo: {
          select: {
            id: true,
            placa: true,
            marca: true,
            modelo: true,
            color: true,
          },
        },
      },
    });

    const vehicleMap: Record<string, { info: (typeof events)[0]['vehiculo']; total: number }> = {};

    for (const event of events) {
      const vid = event.vehiculo.id;
      if (!vehicleMap[vid]) {
        vehicleMap[vid] = { info: event.vehiculo, total: 0 };
      }
      vehicleMap[vid].total++;
    }

    const datos: ByVehicleDataPoint[] = Object.values(vehicleMap)
      .map((v) => ({
        vehiculoId: v.info.id,
        placa: v.info.placa,
        marca: v.info.marca,
        modelo: v.info.modelo,
        color: v.info.color,
        total: v.total,
      }))
      .sort((a, b) => b.total - a.total);

    const totalEventos = datos.reduce((sum, d) => sum + d.total, 0);

    return {
      tipoEvento,
      datos,
      totalEventos,
    };
  }

  async getEvents(
    qry: GetReportsQryDto & { page?: number; limit?: number },
  ): Promise<EventsReportResponse> {
    const { startDate, endDate, tipoEvento, page = 1, limit = 10 } = qry;
    const { start, end } = this.getDateRange(startDate, endDate, GroupBy.DAY);
    const skip = (page - 1) * limit;

    const where: Prisma.EventoAccesoWhereInput = {
      fechaHora: { gte: start, lte: end },
    };
    if (tipoEvento) {
      where.tipoEvento = tipoEvento;
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

    const data = events.map((e) => ({
      id: e.id,
      placa: e.vehiculo.placa,
      marca: e.vehiculo.marca,
      modelo: e.vehiculo.modelo,
      color: e.vehiculo.color,
      tipoEvento: e.tipoEvento,
      puntoControl: e.puntoControl,
      confianzaOcr: e.confianzaOcr?.toNumber() ?? null,
      fechaHora: e.fechaHora,
      personas: e.vehiculo.personas.map((vp) => ({
        nombreCompleto: vp.persona.nombreCompleto,
        rol: vp.persona.rol,
      })),
    }));

    return {
      data,
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

  private getDateRange(
    startDate?: string,
    endDate?: string,
    groupBy?: GroupBy,
  ) {
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

    let dateFormat: string;
    let truncateFn: (d: Date) => Date;

    switch (groupBy) {
      case GroupBy.HOUR:
        dateFormat = 'yyyy-MM-dd HH:00';
        truncateFn = startOfHour;
        break;
      case GroupBy.WEEK:
        dateFormat = 'yyyy-II';
        truncateFn = startOfWeek;
        break;
      case GroupBy.MONTH:
        dateFormat = 'yyyy-MM';
        truncateFn = startOfMonth;
        break;
      case GroupBy.YEAR:
        dateFormat = 'yyyy';
        truncateFn = startOfYear;
        break;
      default:
        dateFormat = 'yyyy-MM-dd';
        truncateFn = startOfDay;
    }

    return { start, end, dateFormat, truncateFn };
  }

  private groupEventsByDate(
    events: { fechaHora: Date }[],
    dateFormat: string,
    truncateFn: (d: Date) => Date,
  ) {
    const grouped: Record<string, number> = {};

    for (const event of events) {
      const truncated = truncateFn(event.fechaHora);
      const key = format(truncated, dateFormat, { timeZone: TIMEZONE });
      grouped[key] = (grouped[key] || 0) + 1;
    }

    return grouped;
  }
}
