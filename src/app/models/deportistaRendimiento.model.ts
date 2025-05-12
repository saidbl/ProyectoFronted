import { Deportista } from "./deportista.model";
import { EvolucionFisicaDTO } from "./evolucionFisicaDTO.model";
import { ObjetivoRendimiento } from "./objetivoRendimiento.model";
import { ProgresoObjetivoDTO } from "./progresoObjetivoDTO.model";
import { RegistroRendimiento } from "./registroRendimiento.model";

export interface DeportistaRendimiento {
    deportista:Deportista;
    registrosRendimiento: RegistroRendimiento[];
    objetivosIncompletos : ObjetivoRendimiento[];
    objetivosTotales: ObjetivoRendimiento[];
    rutinasCompletadas: number;
    totalRutinas:number;
    evolucionFisica:EvolucionFisicaDTO[];
    progresoObjetivo:ProgresoObjetivoDTO[];
}