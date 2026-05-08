import { Controller, Get, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { GetSummaryQryDto, GetReportsQryDto } from './dto/get-reports-qry.dto';
import { Auth } from '@/common/decorators/auth.decorator';
import { RolWeb } from '@/generated/prisma/enums';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

class GetEventsQryDto extends GetReportsQryDto {
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number;

  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number;
}

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('summary/entrada')
  @Auth(RolWeb.ADMINISTRADOR, RolWeb.CONSULTOR)
  getSummaryEntrada(@Query() qry: GetSummaryQryDto) {
    return this.reportsService.getSummaryEntrada(qry);
  }

  @Get('summary/salida')
  @Auth(RolWeb.ADMINISTRADOR, RolWeb.CONSULTOR)
  getSummarySalida(@Query() qry: GetSummaryQryDto) {
    return this.reportsService.getSummarySalida(qry);
  }

  @Get('by-role/entrada')
  @Auth(RolWeb.ADMINISTRADOR, RolWeb.CONSULTOR)
  getByRoleEntrada(@Query() qry: GetSummaryQryDto) {
    return this.reportsService.getByRoleEntrada(qry);
  }

  @Get('by-role/salida')
  @Auth(RolWeb.ADMINISTRADOR, RolWeb.CONSULTOR)
  getByRoleSalida(@Query() qry: GetSummaryQryDto) {
    return this.reportsService.getByRoleSalida(qry);
  }

  @Get('by-vehicle/entrada')
  @Auth(RolWeb.ADMINISTRADOR, RolWeb.CONSULTOR)
  getByVehicleEntrada(@Query() qry: GetSummaryQryDto) {
    return this.reportsService.getByVehicleEntrada(qry);
  }

  @Get('by-vehicle/salida')
  @Auth(RolWeb.ADMINISTRADOR, RolWeb.CONSULTOR)
  getByVehicleSalida(@Query() qry: GetSummaryQryDto) {
    return this.reportsService.getByVehicleSalida(qry);
  }

  @Get('events')
  @Auth(RolWeb.ADMINISTRADOR, RolWeb.CONSULTOR)
  getEvents(@Query() qry: GetEventsQryDto) {
    return this.reportsService.getEvents(qry);
  }
}
