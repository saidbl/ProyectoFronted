import { Deporte } from "./deporte.model"

export interface Organizacion{
    id:number
    email:string
    password:string
    nombre:string
    telefono:string
    direccion:string
    nombreOrganizacion:string
    tipo:string
    rol:string
    deporte:Deporte
    imagen:string
}