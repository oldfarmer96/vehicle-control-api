import { TipoEventoAcceso } from '@/generated/prisma/enums';
import { RolUniversitario } from '@/generated/prisma/enums';

export interface SummaryDataPoint {
  date: string;
  total: number;
}

export interface SummaryReportResponse {
  tipoEvento: TipoEventoAcceso;
  totalEventos: number;
  datos: SummaryDataPoint[];
}

export interface ByRoleDataPoint {
  rol: RolUniversitario;
  total: number;
}

export interface ByRoleReportResponse {
  tipoEvento: TipoEventoAcceso;
  datos: ByRoleDataPoint[];
  totalEventos: number;
}

export interface ByVehicleDataPoint {
  vehiculoId: string;
  placa: string;
  marca: string | null;
  modelo: string | null;
  color: string | null;
  total: number;
}

export interface ByVehicleReportResponse {
  tipoEvento: TipoEventoAcceso;
  datos: ByVehicleDataPoint[];
  totalEventos: number;
}

export interface EventDetail {
  id: string;
  placa: string;
  marca: string | null;
  modelo: string | null;
  color: string | null;
  tipoEvento: TipoEventoAcceso;
  puntoControl: string;
  confianzaOcr: number | null;
  fechaHora: Date;
  personas: { nombreCompleto: string; rol: RolUniversitario }[];
}

export interface EventsReportResponse {
  data: EventDetail[];
  meta: {
    total: number;
    isEmpty: boolean;
    page: number;
    limit: number;
    lastPage: number;
    hasNext: boolean;
    hasPrev: boolean;
    nextPage: number | null;
    prevPage: number | null;
  };
}
