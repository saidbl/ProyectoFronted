import { Deporte } from "./deporte.model"
import { Instructor } from "./instructor.model"
import { Posicion } from "./posicion.model"

export interface Deportista{
    id:number
    email:string
    password:string
    nombre:String
    apellido:String
    fechaNacimiento:Date
    telefono:string
    direccion:string
    rol:string
    genero: string
    estatura: number
    peso: number
    fechaRegistro: Date
    activo:boolean 
    deporte:Deporte
    instructor:Instructor
    posicion:Posicion
}