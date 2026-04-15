/*
  Warnings:

  - Changed the type of `rol` on the `UsuarioWeb` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "RolWeb" AS ENUM ('ADMINISTRADOR', 'CONSULTOR');

-- AlterTable
ALTER TABLE "UsuarioWeb" DROP COLUMN "rol",
ADD COLUMN     "rol" "RolWeb" NOT NULL;

-- DropEnum
DROP TYPE "RolSistemaWeb";
