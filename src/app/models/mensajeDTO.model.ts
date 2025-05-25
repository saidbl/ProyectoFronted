import { RemitenteTipo } from "./remitentetipo.model";

export interface MensajeDTO{
    idChat:number;
    contenido:string;
    remitenteTipo: string;
    remitenteId:number;
    fechaEnvio:Date;
    leido:boolean;
}