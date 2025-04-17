import { Injectable,inject } from "@angular/core";
import { HttpClient, HttpHeaders} from "@angular/common/http";
import { appSettings } from "../settings/appSettings";
import { Observable } from "rxjs";
import { Equipo } from "../models/equipo.model";
import { ResponseAPI } from "../models/ResponseAPI";
import { EquipoDTO } from "../models/equipoDTO.model";
import { Evento } from "../models/evento.model";
@Injectable({
    providedIn:"root"
})
export class EventoService{
    private http=inject(HttpClient)
    list( id: number,token: string): Observable<Evento[]> {
            const headers = new HttpHeaders({
                'Authorization': `Bearer ${token}`
            });
            return this.http.get<Evento[]>(`${appSettings.apiEventoEquipo}?id=${id}`, { headers });
        }
    delete(id: number, token: string): Observable<ResponseAPI>{
            const headers = new HttpHeaders({
                'Authorization': `Bearer ${token}`
            });
            return this.http.delete<ResponseAPI>(`${appSettings.apiEliminarEquipos}/${id}`,{ headers })
        }
    add(equipo:EquipoDTO, token: string):Observable<Equipo>{
            const headers = new HttpHeaders({
                'Authorization': `Bearer ${token}`
            });
            return this.http.post<Equipo>(`${appSettings.apiAgregarEquipos}`,equipo,{ headers })
        }
    listEventosByDeportista(id : number, token : string):Observable<Evento[]>{
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
        return this.http.get<Evento[]>(`${appSettings.apiEventosFuturosDep}/${id}`,{ headers })
    }
}