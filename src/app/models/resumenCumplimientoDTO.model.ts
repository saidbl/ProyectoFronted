import { AtletaPendienteDTO } from "./atletaPendienteDTO.model";
import { DiaSemanaDTO } from "./diaSemanaDTO.model";

export interface ResumenCumplimientoDTO {
  porcentajeCompletadas: number;
  porcentajeIncompletas: number;
  cumplimientoPorDia: DiaSemanaDTO[];
  topPendientes: AtletaPendienteDTO[];
}