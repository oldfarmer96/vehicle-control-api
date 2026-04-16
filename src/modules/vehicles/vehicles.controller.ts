import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { FindVehicleQryDto } from './dto/find-vehicle-qry.dto';
import { ParsePlacaPipe } from './pipes/parse-placa.pipe';

@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehicleService: VehiclesService) {}

  @Post()
  createVehicle(@Body() dto: CreateVehicleDto) {
    return this.vehicleService.createVehicle(dto);
  }

  @Get()
  getAllVehicles(@Query() qry: FindVehicleQryDto) {
    return this.vehicleService.getAllVehicles(qry);
  }

  @Get(':placa/placa')
  getVehicleByPlaca(@Param('placa', ParsePlacaPipe) placa: string) {
    return this.vehicleService.getVehicleByPlaca(placa);
  }
}
