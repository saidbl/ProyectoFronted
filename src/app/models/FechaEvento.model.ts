import { LocalTime } from "./LocalTime";

export interface FechaEvento{
    fecha: Date;
    horaInicio:LocalTime;
    horaFin:LocalTime;
   estado:string;
}