import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { PersonsService } from './persons.service';
import { CreatePersonDto } from './dto/create-person.dto';
import { FindPersonsQryDto } from './dto/find-persons-qry.dto';
import { UpdateAccessStatusDto } from './dto/update-access-status.dto';

@Controller('persons')
export class PersonsController {
  constructor(private readonly personService: PersonsService) {}

  @Post()
  createPerson(@Body() dto: CreatePersonDto) {
    return this.personService.createPerson(dto);
  }

  @Get()
  getAllPersons(@Query() qry: FindPersonsQryDto) {
    return this.personService.getAllPersons(qry);
  }

  @Patch(':id/access-status')
  toggleAccessStatus(
    @Param(
      'id',
      new ParseUUIDPipe({
        errorHttpStatusCode: HttpStatus.BAD_REQUEST,
        exceptionFactory: () => new BadRequestException('invalid id'),
      }),
    )
    id: string,
    @Body() dto: UpdateAccessStatusDto,
  ) {
    return this.personService.updateAccessStatus(id, dto.status);
  }
}
