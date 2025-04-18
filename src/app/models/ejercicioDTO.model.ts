import { RecursoRutina } from "./recursoRutina.model"

export interface EjercicioDTO{
    idrutina? : number
    nombre : string
    descripcion: string
    series : number
    repeticiones: string
    descanso : string
    orden : number
    recursos : RecursoRutina[]
}