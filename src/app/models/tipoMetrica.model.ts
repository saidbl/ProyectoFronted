import { Deporte } from "./deporte.model";
import { Deportista } from "./deportista.model";

export interface TipoMetrica{
    id:number;
    nombre:string;
    unidad:string;
    deporte:Deporte;
    esObjetivo:boolean;
    deportista:Deportista
}