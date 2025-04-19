import { Equipo } from "./equipo.model";
import { Evento } from "./evento.model";

export interface EventoEquipo{
    id?: number;
    evento: Evento;
    equipo: Equipo;
}