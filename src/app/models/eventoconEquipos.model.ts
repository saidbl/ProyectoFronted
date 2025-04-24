import { Equipo } from "./equipo.model";
import { Evento } from "./evento.model";

export interface EventoConEquipos {
    evento: Evento;
    equipos: Equipo[];
  }