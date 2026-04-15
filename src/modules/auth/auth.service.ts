import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@src/core/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.usuarioWeb.findFirst({
      where: { username: dto.userName },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const pwdIsMatch = await bcrypt.compare(dto.password, user.passwordHash);

    if (!pwdIsMatch) {
      throw new UnauthorizedException('Datos invalidos');
    }

    const payload = { sub: user.id, userName: user.username, role: user.rol };
    const token = await this.jwtService.signAsync(payload);
    const { passwordHash, ...result } = user;

    return { token, result };
  }
}
