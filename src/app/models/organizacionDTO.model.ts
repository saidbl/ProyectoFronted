import { Deporte } from "./deporte.model"

export interface OrganizacionDTO{
    id:number
    email:string
    password:string
    nombre:string
    telefono:string
    direccion:string
    nombreOrganizacion:string
    tipo:string
    rol:string
    idDeporte:number
}