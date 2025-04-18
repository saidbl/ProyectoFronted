import { EjercicioDTO } from "./ejercicioDTO.model";
import { EjercicioRutinaDTO } from "./ejercicioRutinaDTO.model";

export interface RutinaDTOR {
    id?: number;
    nombre:string
    dia: string;
    idInstructor: number;
    idPosicion: number;
    descripcion: string;
    nivel_dificultad:string;
    objetivo:string;
    duracion_esperada:number;
    ejercicios : EjercicioDTO[]
  }