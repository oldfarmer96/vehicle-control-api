import { CurrentUserI } from '@/common/interfaces/current-user.interface';
import { JwtPayload } from '@/common/interfaces/jwt-payload.interface';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          const cookieName =
            configService.get<string>('COOKIE_NAME') || 'vehicleControlAuth';
          return request?.cookies?.[cookieName];
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET') || '1!2@3#4$5%',
    });
  }

  async validate(payload: JwtPayload): Promise<CurrentUserI> {
    return { id: payload.sub, userName: payload.userName, role: payload.role };
  }
}
