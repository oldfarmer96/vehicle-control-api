import { RolUniversitario, TipoEventoAcceso } from '@/generated/prisma/enums';

export interface PayloadI {
  id: string;
  vehiculoId: string;
  tipoEvento: TipoEventoAcceso;
  puntoControl: string;
  confianzaOcr?: number;
  fechaHora: Date;
  vehiculo: Vehiculo;
}

export interface Vehiculo {
  placa: string;
  marca: string | null;
  modelo: string | null;
  color: string | null;
  personas: Personas[];
}

export interface Personas {
  id: string;
  vehiculoId: string;
  personaId: string;
  asignadoEn: Date;
  persona: Persona;
}

export interface Persona {
  nombreCompleto: string;
  rol: RolUniversitario;
}
