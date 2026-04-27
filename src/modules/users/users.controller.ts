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
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { FindUsersQueryDto } from './dto/find-users-qry.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RolWeb } from '@/generated/prisma/enums';
import { Auth } from '@/common/decorators/auth.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { type CurrentUserI } from '@/common/interfaces/current-user.interface';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Post()
  @Auth(RolWeb.ADMINISTRADOR)
  createUser(@Body() dto: CreateUserDto) {
    return this.userService.createUser(dto);
  }

  @Get()
  @Auth(RolWeb.ADMINISTRADOR)
  getAllUsers(@Query() qry: FindUsersQueryDto) {
    return this.userService.getAllUsers(qry);
  }

  @Patch(':id/status')
  updateState(
    @Param(
      'id',
      new ParseUUIDPipe({
        errorHttpStatusCode: HttpStatus.BAD_REQUEST,
        exceptionFactory: () => new BadRequestException('invalid id'),
      }),
    )
    id: string,
    @Body() dto: UpdateUserStatusDto,
  ) {
    return this.userService.updateState(dto.status, id);
  }

  @Patch(':id')
  updateUser(
    @Param(
      'id',
      new ParseUUIDPipe({
        errorHttpStatusCode: HttpStatus.BAD_REQUEST,
        exceptionFactory: () => new BadRequestException('invalid id'),
      }),
    )
    id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.userService.updateUser(id, dto);
  }

  @Get('profile')
  @Auth()
  getProfile(@CurrentUser() user: CurrentUserI) {
    return this.userService.getProfile(user.id);
  }
}
