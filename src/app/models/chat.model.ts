import { ChatParticipantes } from "./chatParticipantes.model";
import { ChatTipo } from "./chatTipo.model";
import { Deporte } from "./deporte.model";
import { Deportista } from "./deportista.model";
import { Equipo } from "./equipo.model";
import { Instructor } from "./instructor.model";
import { Organizacion } from "./organizacion.model";

export interface Chat{
    id:number;
    tipo:ChatTipo;
    deporte:Deporte;
    instructor:Instructor;
    deportista:Deportista;
    organizacion:Organizacion;
    equipo:Equipo;
    participantes:ChatParticipantes[];
    fechaCreacion:Date;
}