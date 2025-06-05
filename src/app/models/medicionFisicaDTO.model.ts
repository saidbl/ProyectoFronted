

export interface MedicionFisicaDTO {
  id: number;
  idDeportista: number;
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