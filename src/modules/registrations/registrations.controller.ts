import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { RegistrationsService } from './registrations.service';
import { CreateFullRegistrationDto } from './dto/create-full-registration.dto';

@Controller('registrations')
export class RegistrationsController {
  constructor(private readonly registrationsService: RegistrationsService) {}

  @Post('full')
  @HttpCode(HttpStatus.CREATED)
  async createFullRegistration(
    @Body() createFullRegistrationDto: CreateFullRegistrationDto,
  ) {
    return this.registrationsService.registerFull(createFullRegistrationDto);
  }
}
