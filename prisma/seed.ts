import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';
import bcryptjs from 'bcryptjs';
import { Pool } from 'pg';
import { Prisma, PrismaClient, RolWeb } from '../src/generated/prisma/client';

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const users: Prisma.UsuarioWebCreateInput[] = [
  {
    dni: '74843111',
    username: 'jos3lo',
    nombre: 'jose luis',
    apellidos: 'galindo cardenas',
    password: '123456',
    rol: RolWeb.ADMINISTRADOR,
  },
  {
    dni: '74843112',
    username: 'haru',
    nombre: 'haruhi',
    apellidos: 'suzumiya',
    password: '123456',
    rol: RolWeb.CONSULTOR,
  },
];

async function main() {
  console.log('... Iniciando seed');

  const salt = await bcryptjs.genSalt(10);
  const hashedPwd = await bcryptjs.hash('123456', salt);

  for (const u of users) {
    const user = await prisma.usuarioWeb.upsert({
      where: { username: u.username },
      update: {
        ...u,
        password: hashedPwd,
      },
      create: {
        ...u,
        password: hashedPwd,
      },
    });

    console.log(`Created user with userName: ${user.username}`);
  }
  console.log(`Seeding finished.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
