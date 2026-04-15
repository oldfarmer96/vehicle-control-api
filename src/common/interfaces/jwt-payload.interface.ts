import { RolSistemaWeb } from 'src/generated/prisma/enums';

export interface JwtPayload {
  sub: string;
  userName: string;
  role: RolSistemaWeb;
  iat: number;
  exp: number;
}
