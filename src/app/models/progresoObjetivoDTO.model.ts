export interface ProgresoObjetivoDTO {
    id:number
    nombreObjetivo: string;
    unidad: string;
    valorActual: number;
    valorObjetivo: number;
    porcentajeCompletado: number;
    fechaObjetivo: string;
    completado: boolean;
  }