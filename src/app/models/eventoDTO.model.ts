import { EventoFecha } from "./eventoFecha.model";
import { LocalTime } from "./LocalTime";

export interface EventoDTO{
    id? : number;
    nombre : string ;
    idOrganizacion: number;
    idDeporte:number;
    numMaxEquipos:number;
    fecha:Date;
    fechaFin:Date;
    descripcion:string;
    ubicacion:string;
    horaInicio:string;
    horaFin: string;
    estado:string;
    contactoOrganizador:string;
    recurrente:boolean;
    frecuencia:string;
    diasSemana:string[];
    excluirFines:boolean;
    fechas: EventoFecha[];
    equiposInscritos:number;
}