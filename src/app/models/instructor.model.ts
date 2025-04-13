import { Deporte } from "./deporte.model"

export interface Instructor{
    id:number
    email:String
    password:String
    nombre: String
    apellido:String
    telefono:String
    especialidad:String
    experiencia:number
    rol:String
    deporte:Deporte
}