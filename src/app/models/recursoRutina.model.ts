export interface RecursoRutina {
    id: number;
    idEjercicioRutina: number;
    tipo: 'VIDEO' | 'IMAGEN' | 'PDF';
    url: string;
    descripcion?: string;
  }