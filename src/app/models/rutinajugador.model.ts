import { Deportista } from "./deportista.model"
import { Rutina } from "./rutina.model"

export interface RutinaJugador{
    id:number
    deportista: Deportista
    rutina: Rutina
}