import { Deportista } from "./deportista.model";
import { Instructor } from "./instructor.model";
import { Organizacion } from "./organizacion.model";

export interface ResponseAPI{
    statusCode: number;
    id : number;
    error: string;
    message : string;
    token : string;
    refreshToken : string;
    expirationTime : string;
    username : string;
    password : string;
    email : string;
    rol : string;
    deportista : Deportista;
    deportistas : Deportista[];
    instructor : Instructor;
    instructores : Instructor[];
    organizacion : Organizacion;
    organizaciones : Organizacion[];
    idDeporte: number;
    success: boolean;
}