import { Deporte } from "./deporte.model"

export interface InstructorDTO{
    email:String
    nombre: String
    apellido:String
    telefono:String
    especialidad:String
    experiencia:number
    idDeporte:number
    fotoPerfil:string
}