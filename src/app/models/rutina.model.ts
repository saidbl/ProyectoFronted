import { Instructor } from "./instructor.model"
import { Posicion } from "./posicion.model"

export interface Rutina{
    id:number
    nombre:string
    instructor?:Instructor| null
    posicion:Posicion
    descripcion:string
    dia:string
    nivel_dificultad:string
    objetivo:string;
    duracion_esperada:number;
}