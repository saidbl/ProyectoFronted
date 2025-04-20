import { Deporte } from "./deporte.model"
import { LocalTime } from "./LocalTime"
import { Organizacion } from "./organizacion.model"

export interface Evento{
    id : number
    nombre : string
    organizacion : Organizacion
    deporte : Deporte
    numMaxEquipos:number
    fecha: Date
    descripcion:string
    ubicacion:string
    horaInicio:LocalTime
    horaFin : LocalTime
    estado:string
    contactoOrganizador:string
    equiposInscritos:number
    fechaFin: Date
    recurrente: boolean;
    frecuencia:string;
    diasSemana: string[];
    excluirFines: string;

}