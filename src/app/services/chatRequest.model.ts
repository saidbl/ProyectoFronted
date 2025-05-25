import { ChatTipo } from "../models/chatTipo.model";

export interface ChatRequest{
    tipo:ChatTipo;
    instructorId:number; 
    deportistaId:number; 
    organizacionId:number; 
    equipoId:number; 
    deporteId:number; 
}