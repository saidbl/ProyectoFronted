import { Deporte } from "./deporte.model";
import { Deportista } from "./deportista.model";

export interface TipoMetricaDTO{
    id:number;
    nombre:string;
    unidad:string;
    iddeporte:number;
    esObjetivo:boolean;
    iddeportista:number
}