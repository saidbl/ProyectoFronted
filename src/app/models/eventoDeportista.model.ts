import { FechaEvento } from "./FechaEvento.model";

export interface EventoDeportistaDTO{
    id:number,
    nombre:string;
    descripcion:string
    ubicacion:string
    estado:string
    nombreOrganizador:string
    deporte:string
    fechas: FechaEvento[];
}