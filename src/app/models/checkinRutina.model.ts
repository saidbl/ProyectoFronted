import { Deportista } from "./deportista.model"
import { LocalTime } from "./LocalTime"
import { Rutina } from "./rutina.model"

export interface CheckInRutina{
    id:number
    rutina:Rutina
    deportista : Deportista
    fecha : Date
    estado: string
    comentarios : string
    hora : LocalTime
}