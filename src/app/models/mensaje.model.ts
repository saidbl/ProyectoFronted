import { Chat } from "./chat.model";
import { RemitenteTipo } from "./remitentetipo.model";

export interface Mensaje{
    id:number;
    chat:Chat;
    contenido:string;
    remitenteTipo:RemitenteTipo;
    remitenteId:number;
    fechaEnvio:Date;
    leido:boolean;
}