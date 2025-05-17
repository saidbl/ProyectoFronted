import { EjercicioRutina } from "./ejercicioRutina.model";

export interface RecursoRutina {
    id: number;
    ejercicioRutina: EjercicioRutina;
    tipo: 'VIDEO' | 'IMAGEN' | 'PDF';
    url: string;
    descripcion?: string;
  }