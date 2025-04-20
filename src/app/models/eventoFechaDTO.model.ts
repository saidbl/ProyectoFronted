import { LocalTime } from "./LocalTime";

export interface EventoFechaDTO{
    id:number;
    fecha:Date;
    horaInicio:LocalTime;
    horaFin:LocalTime;
    estado:string;
}