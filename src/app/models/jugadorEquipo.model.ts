import { Deportista } from "./deportista.model"
import { Equipo } from "./equipo.model"

export interface JugadorEquipo{
    id: number
    deportista:Deportista
    equipo:Equipo
}