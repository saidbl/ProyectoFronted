import { Deportista } from "./deportista.model";
import { TipoMetrica } from "./tipoMetrica.model";

export interface RegistroRendimiento{
    id:number;
    deportista: Deportista;
    metrica: TipoMetrica;
    fecha: Date;
    valor:number;
    comentarios:string;
}