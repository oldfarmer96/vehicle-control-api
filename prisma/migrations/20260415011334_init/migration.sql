-- CreateEnum
CREATE TYPE "RolUniversitario" AS ENUM ('DOCENTE', 'ALUMNO', 'ADMINISTRATIVO', 'VISITANTE');

-- CreateEnum
CREATE TYPE "TipoEventoAcceso" AS ENUM ('ENTRADA', 'SALIDA');

-- CreateEnum
CREATE TYPE "RolSistemaWeb" AS ENUM ('ADMINISTRADOR', 'CONSULTOR');

-- CreateTable
CREATE TABLE "UsuarioWeb" (
    "id" UUID NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "apellidos" VARCHAR(50) NOT NULL,
    "dni" VARCHAR(15) NOT NULL,
    "username" VARCHAR(15) NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "rol" "RolSistemaWeb" NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UsuarioWeb_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehiculo" (
    "id" UUID NOT NULL,
    "placa" VARCHAR(15) NOT NULL,
    "marca" VARCHAR(50),
    "modelo" VARCHAR(50),
    "color" VARCHAR(50),
    "vin" VARCHAR(50),
    "motor" VARCHAR(50),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vehiculo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Persona" (
    "id" UUID NOT NULL,
    "dni" VARCHAR(15) NOT NULL,
    "nombreCompleto" VARCHAR(150) NOT NULL,
    "rol" "RolUniversitario" NOT NULL,
    "tieneAccesoPermitido" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Persona_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehiculoPersona" (
    "id" UUID NOT NULL,
    "vehiculoId" UUID NOT NULL,
    "personaId" UUID NOT NULL,
    "asignadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VehiculoPersona_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventoAcceso" (
    "id" UUID NOT NULL,
    "vehiculoId" UUID NOT NULL,
    "tipoEvento" "TipoEventoAcceso" NOT NULL,
    "puntoControl" VARCHAR(50) NOT NULL,
    "confianzaOcr" DECIMAL(5,2),
    "fechaHora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventoAcceso_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UsuarioWeb_dni_key" ON "UsuarioWeb"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "UsuarioWeb_username_key" ON "UsuarioWeb"("username");

-- CreateIndex
CREATE INDEX "UsuarioWeb_createdAt_idx" ON "UsuarioWeb"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Vehiculo_placa_key" ON "Vehiculo"("placa");

-- CreateIndex
CREATE INDEX "Vehiculo_createdAt_idx" ON "Vehiculo"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Persona_dni_key" ON "Persona"("dni");

-- CreateIndex
CREATE INDEX "Persona_nombreCompleto_idx" ON "Persona"("nombreCompleto");

-- CreateIndex
CREATE INDEX "Persona_createdAt_idx" ON "Persona"("createdAt");

-- CreateIndex
CREATE INDEX "VehiculoPersona_vehiculoId_idx" ON "VehiculoPersona"("vehiculoId");

-- CreateIndex
CREATE INDEX "VehiculoPersona_personaId_idx" ON "VehiculoPersona"("personaId");

-- CreateIndex
CREATE INDEX "VehiculoPersona_asignadoEn_idx" ON "VehiculoPersona"("asignadoEn");

-- CreateIndex
CREATE UNIQUE INDEX "VehiculoPersona_vehiculoId_personaId_key" ON "VehiculoPersona"("vehiculoId", "personaId");

-- CreateIndex
CREATE INDEX "EventoAcceso_vehiculoId_idx" ON "EventoAcceso"("vehiculoId");

-- CreateIndex
CREATE INDEX "EventoAcceso_fechaHora_idx" ON "EventoAcceso"("fechaHora");

-- CreateIndex
CREATE INDEX "EventoAcceso_vehiculoId_fechaHora_idx" ON "EventoAcceso"("vehiculoId", "fechaHora");

-- CreateIndex
CREATE INDEX "EventoAcceso_tipoEvento_fechaHora_idx" ON "EventoAcceso"("tipoEvento", "fechaHora");

-- AddForeignKey
ALTER TABLE "VehiculoPersona" ADD CONSTRAINT "VehiculoPersona_vehiculoId_fkey" FOREIGN KEY ("vehiculoId") REFERENCES "Vehiculo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehiculoPersona" ADD CONSTRAINT "VehiculoPersona_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "Persona"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventoAcceso" ADD CONSTRAINT "EventoAcceso_vehiculoId_fkey" FOREIGN KEY ("vehiculoId") REFERENCES "Vehiculo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
