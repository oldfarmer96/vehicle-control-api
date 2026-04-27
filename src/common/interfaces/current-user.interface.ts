import { RolWeb } from '@/generated/prisma/enums';

export interface CurrentUserI {
  id: string;
  role: RolWeb;
  userName: string;
}
