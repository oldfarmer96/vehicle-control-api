import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { FindVehicleQryDto } from './dto/find-vehicle-qry.dto';
import { ParsePlacaPipe } from './pipes/parse-placa.pipe';
import { AssignOwnerDto } from './dto/assign-owner.dto';
import { Auth } from '@/common/decorators/auth.decorator';
import { RolWeb } from '@/generated/prisma/enums';
import { UUIDPipe } from '@/common/pipes/parse-uuid.pipe';

@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehicleService: VehiclesService) {}

  @Post()
  @Auth(RolWeb.ADMINISTRADOR)
  createVehicle(@Body() dto: CreateVehicleDto) {
    return this.vehicleService.createVehicle(dto);
  }

  @Get()
  @Auth(RolWeb.ADMINISTRADOR)
  getAllVehicles(@Query() qry: FindVehicleQryDto) {
    return this.vehicleService.getAllVehicles(qry);
  }

  @Get(':placa/placa')
  @Auth(RolWeb.ADMINISTRADOR)
  getVehicleByPlaca(@Param('placa', ParsePlacaPipe) placa: string) {
    return this.vehicleService.getVehicleByPlaca(placa);
  }

  @Post(':id/assign-owner')
  @Auth(RolWeb.ADMINISTRADOR)
  assignOwner(
    @Param('id', UUIDPipe) vehiculoId: string,
    @Body() assignOwnerDto: AssignOwnerDto,
  ) {
    return this.vehicleService.assignOwner(vehiculoId, assignOwnerDto);
  }
}
