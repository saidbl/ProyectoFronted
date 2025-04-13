import { Rutina } from "./rutina.model";

export interface EjercicioRutina{
    id : number
    rutina : Rutina
    nombre : string
    descripcion: string
    series : number
    repeticiones: string
    descanso : string
    orden : number
}