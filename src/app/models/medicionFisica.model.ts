import { Deportista } from "./deportista.model";

export interface MedicionFisica {
  id: number;
  deportista: Deportista;
  fecha: string; 
  peso: number;
  estatura: number;
  imc: number;
  porcentajeGrasa: number;
  masaMuscular: number;
  circunferenciaBrazo: number;
  circunferenciaCintura: number;
  circunferenciaCadera: number;
  presionArterial:string
  frecuenciaCardiacaReposo:number
  notas : string
}