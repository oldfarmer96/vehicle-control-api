import { Body, Controller, Post } from '@nestjs/common';
import { RegistrationsService } from './registrations.service';
import { CreateFullRegistrationDto } from './dto/create-full-registration.dto';
import { Auth } from '@/common/decorators/auth.decorator';
import { RolWeb } from '@/generated/prisma/enums';

@Controller('registrations')
export class RegistrationsController {
  constructor(private readonly registrationsService: RegistrationsService) {}

  @Post('full')
  @Auth(RolWeb.ADMINISTRADOR)
  async createFullRegistration(
    @Body() createFullRegistrationDto: CreateFullRegistrationDto,
  ) {
    return this.registrationsService.registerFull(createFullRegistrationDto);
  }
}
