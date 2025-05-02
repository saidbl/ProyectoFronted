
import { Deportista } from "./deportista.model";
import { TipoMetrica } from "./tipoMetrica.model";

export interface ObjetivoRendimientoDTO{
    id:number;
    iddeportista:number;
    idmetrica: number;
    valorObjetivo:number;
    fechaObjetivo:Date;
    fechaEstablecido:Date;
    completado:boolean;
    prioridad:number;
}