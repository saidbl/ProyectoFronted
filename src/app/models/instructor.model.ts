import { Deporte } from "./deporte.model"

export interface Instructor{
    id:number
    email:string
    password:string
    nombre: string
    apellido:string
    telefono:string
    especialidad:string
    experiencia:number
    rol:string
    deporte:Deporte
    fotoPerfil:string
}