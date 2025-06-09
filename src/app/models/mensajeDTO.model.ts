import { RemitenteTipo } from "./remitentetipo.model";

export interface MensajeDTO{
    id?:number
    idChat:number;
    contenido:string;
    remitenteTipo: string;
    remitenteId:number;
    fechaEnvio:Date;
    leido:boolean;
}