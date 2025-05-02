
import { Deportista } from "./deportista.model";
import { TipoMetrica } from "./tipoMetrica.model";

export interface ObjetivoRendimiento{
    id:number;
    deportista:Deportista;
    metrica: TipoMetrica;
    valorObjetivo:number;
    fechaObjetivo:Date;
    fechaEstablecido:Date;
    completado:boolean;
    prioridad:number;
}