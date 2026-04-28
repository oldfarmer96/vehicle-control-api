import {
  Body,
  Controller,
  Get,
  Param,
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
import { UUIDPipe } from '@/common/pipes/parse-uuid.pipe';
import { ProfileDto } from './dto/get-profile.dto';

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
  @Auth(RolWeb.ADMINISTRADOR)
  updateState(
    @Param('id', UUIDPipe) id: string,
    @Body() dto: UpdateUserStatusDto,
  ) {
    return this.userService.updateState(dto.status, id);
  }

  @Patch(':id')
  @Auth(RolWeb.ADMINISTRADOR)
  updateUser(@Param('id', UUIDPipe) id: string, @Body() dto: UpdateUserDto) {
    return this.userService.updateUser(id, dto);
  }

  @Get('profile')
  @Auth()
  async getProfile(@CurrentUser() user: CurrentUserI): Promise<ProfileDto> {
    return await this.userService.getProfile(user.id);
  }
}
