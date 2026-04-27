import { RolWeb } from '@/generated/prisma/enums';

export interface JwtPayload {
  sub: string;
  userName: string;
  role: RolWeb;
  iat: number;
  exp: number;
}
