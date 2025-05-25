import { PosicionGenero } from "./posicionGeneroDTO.model";

export interface ResumenAtletasDTO {
  totalMasculinos: number;
  totalFemeninos: number;
  edadPromedioGeneral: number;
  edadPromedioHombres: number;
  edadPromedioMujeres: number;
  distribucionPosicionGenero: PosicionGenero[];
}