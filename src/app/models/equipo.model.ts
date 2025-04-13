import { Deporte } from "./deporte.model"
import { Instructor } from "./instructor.model"

export interface Equipo{
    id: number
    nombre:string
    instructor: Instructor
    deporte : Deporte
    maxJugadores : number
    fechaCreacion : Date
    estado : string
    categoria : string
    jugadoresAsociados : number
}