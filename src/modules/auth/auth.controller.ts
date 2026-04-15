import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import type { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { Auth } from 'src/common/decorators/auth.decorator';

@Controller('auth')
export class AuthController {
  private readonly cookieMaxAge = 1000 * 60 * 60 * 24;

  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() body: LoginDto,
    @Res({
      passthrough: true,
    })
    res: Response,
  ) {
    const { result, token } = await this.authService.login(body);

    res.cookie('vehicleControlAuth', token, {
      httpOnly: true,
      secure: this.isProd(),
      sameSite: this.isProd() ? 'none' : 'lax',
      maxAge: this.cookieMaxAge,
    });

    return result;
  }

  @Post('logout')
  @Auth()
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('vehicleControlAuth', {
      httpOnly: true,
      secure: this.isProd(),
      sameSite: this.isProd() ? 'none' : 'lax',
    });

    return { message: 'Sesión cerrada' };
  }

  // utils
  isProd(): boolean {
    return this.configService.get<string>('NODE_ENV') === 'production';
  }
}
