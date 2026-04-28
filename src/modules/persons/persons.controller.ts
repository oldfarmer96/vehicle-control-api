import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { PersonsService } from './persons.service';
import { CreatePersonDto } from './dto/create-person.dto';
import { FindPersonsQryDto } from './dto/find-persons-qry.dto';
import { UpdateAccessStatusDto } from './dto/update-access-status.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { Auth } from '@/common/decorators/auth.decorator';
import { RolWeb } from '@/generated/prisma/enums';
import { UUIDPipe } from '@/common/pipes/parse-uuid.pipe';

@Controller('persons')
export class PersonsController {
  constructor(private readonly personService: PersonsService) {}

  @Post()
  @Auth(RolWeb.ADMINISTRADOR)
  createPerson(@Body() dto: CreatePersonDto) {
    return this.personService.createPerson(dto);
  }

  @Get()
  @Auth(RolWeb.ADMINISTRADOR)
  getAllPersons(@Query() qry: FindPersonsQryDto) {
    return this.personService.getAllPersons(qry);
  }

  @Patch(':id/access-status')
  @Auth(RolWeb.ADMINISTRADOR)
  toggleAccessStatus(
    @Param('id', UUIDPipe) id: string,
    @Body() dto: UpdateAccessStatusDto,
  ) {
    return this.personService.updateAccessStatus(id, dto.status);
  }

  @Patch(':id')
  @Auth(RolWeb.ADMINISTRADOR)
  updatePerson(
    @Param('id', UUIDPipe) id: string,
    @Body() dto: UpdatePersonDto,
  ) {
    return this.personService.updatePerson(id, dto);
  }
}
