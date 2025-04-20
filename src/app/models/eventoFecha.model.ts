import { Evento } from "./evento.model";
import { LocalTime } from "./LocalTime";

export interface EventoFecha{
    id: number;
    evento : Evento;
    fecha:Date;
    horaInicio:LocalTime;
    horaFin:LocalTime;
    estado:string;
    motivoCancelacion:string;
}