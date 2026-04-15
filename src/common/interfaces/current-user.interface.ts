import { RolSistemaWeb } from 'src/generated/prisma/enums';

export interface CurrentUserI {
  id: string;
  role: RolSistemaWeb;
  userName: string;
}
