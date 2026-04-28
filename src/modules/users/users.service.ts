import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import bcrypt from 'bcryptjs';
import { FindUsersQueryDto } from './dto/find-users-qry.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '@/core/prisma/prisma.service';
import { Prisma } from '@/generated/prisma/client';
import { ProfileDto } from './dto/get-profile.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(private readonly prisma: PrismaService) {}

  async createUser(dto: CreateUserDto) {
    const userFind = await this.prisma.usuarioWeb.findFirst({
      where: { OR: [{ dni: dto.dni }, { username: dto.username }] },
    });

    if (userFind) {
      throw new ConflictException('El usuario ya existe');
    }

    try {
      const salt = await bcrypt.genSalt(10);
      const pwdHash = await bcrypt.hash(dto.password, salt);

      const newUser = await this.prisma.usuarioWeb.create({
        data: {
          ...dto,
          password: pwdHash,
        },
        omit: {
          password: true,
        },
      });

      return newUser;
    } catch (error) {
      this.logger.warn(`Error al crear usuario - ${dto.username}`, error);
      throw new InternalServerErrorException('Ocurrio un error interno');
    }
  }

  async getAllUsers(qry: FindUsersQueryDto) {
    const { page = 1, limit = 5, search } = qry;
    const skip = (page - 1) * limit;

    const where: Prisma.UsuarioWebWhereInput = search
      ? {
          OR: [
            { nombre: { contains: search, mode: 'insensitive' } },
            { apellidos: { contains: search, mode: 'insensitive' } },
            { username: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [total, users] = await Promise.all([
      this.prisma.usuarioWeb.count({ where }),
      this.prisma.usuarioWeb.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'asc' },
        omit: {
          password: true,
        },
      }),
    ]);

    const lastPage = Math.ceil(total / limit);
    const next = page < lastPage ? page + 1 : null;
    const prev = page > 1 ? page - 1 : null;

    return {
      data: users,
      meta: {
        total,
        isEmpty: total == 0,
        page,
        limit,
        lastPage,
        hasNext: page < lastPage,
        hasPrev: page > 1,
        nextPage: next,
        prevPage: prev,
      },
    };
  }

  async updateState(state: boolean, id: string) {
    const userFind = await this.prisma.usuarioWeb.findUnique({ where: { id } });

    if (!userFind) {
      throw new NotFoundException('Usuario no encontrado');
    }

    try {
      const userUpdated = await this.prisma.usuarioWeb.update({
        where: { id },
        data: { activo: state },
        omit: { password: true },
      });

      return userUpdated;
    } catch (error) {
      this.logger.warn('Error al actualizar usuario', error);
      throw new InternalServerErrorException('Ocurrio un error interno');
    }
  }

  async updateUser(id: string, dto: UpdateUserDto) {
    const userFind = await this.prisma.usuarioWeb.findUnique({ where: { id } });

    if (!userFind) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (dto.dni && dto.dni !== userFind.dni) {
      const dniExists = await this.prisma.usuarioWeb.findUnique({
        where: { dni: dto.dni },
      });
      if (dniExists) throw new ConflictException('El DNI ya está en uso');
    }

    if (dto.username && dto.username !== userFind.username) {
      const usernameExists = await this.prisma.usuarioWeb.findUnique({
        where: { username: dto.username },
      });
      if (usernameExists)
        throw new ConflictException('El nombre de usuario ya está en uso');
    }

    try {
      const userUpdate = await this.prisma.usuarioWeb.update({
        where: { id },
        data: dto,
        omit: { password: true },
      });

      return userUpdate;
    } catch (error) {
      this.logger.error(
        `Ocurrio un error al actualizar usuario : ${userFind.nombre}`,
        error,
      );
      throw new InternalServerErrorException('Ocurrio un error interno');
    }
  }

  async getProfile(id: string): Promise<ProfileDto> {
    const user = await this.prisma.usuarioWeb.findUnique({
      where: { id },
      omit: {
        password: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user;
  }
}
