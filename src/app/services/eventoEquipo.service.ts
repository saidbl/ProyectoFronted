import { Injectable,inject } from "@angular/core";
import { HttpClient, HttpHeaders} from "@angular/common/http";
import { appSettings } from "../settings/appSettings";
import { Observable } from "rxjs";
import { JugadorEquipo } from "../models/jugadorEquipo.model";
import { JugadorEquipoDTO } from "../models/jugadorEquipoDTO.model";
import { EventoEquipo } from "../models/eventoEquipo.model";
import { EventoEquipoDTO } from "../models/eventoEquipoDTO.model";
import { Equipo } from "../models/equipo.model";
import { Evento } from "../models/evento.model";
import { ResponseAPI } from "../models/ResponseAPI";
@Injectable({
    providedIn:"root"
})
export class EventoEquipoService{
    private http=inject(HttpClient)

    list( id: number,token: string): Observable<EventoEquipo[]> {
            const headers = new HttpHeaders({
                'Authorization': `Bearer ${token}`
            });
            return this.http.get<EventoEquipo[]>(`${appSettings.apiEventoEquipos}?id=${id}`, { headers });
        }
    add(jugadorequipo:EventoEquipoDTO, token: string):Observable<EventoEquipo>{
                const headers = new HttpHeaders({
                    'Authorization': `Bearer ${token}`
                });
                return this.http.post<EventoEquipo>(`${appSettings.apiVincularEvento}`,jugadorequipo,{ headers })
        }
    listEquiposEvento(id: number,token: string): Observable<Equipo[]> {
            const headers = new HttpHeaders({
                'Authorization': `Bearer ${token}`
            });
            return this.http.get<Equipo[]>(`${appSettings.apiEquiposEvento}/${id}`, { headers });
        }

    listEventosEquipo(id: number,token: string): Observable<Evento[]> {
            const headers = new HttpHeaders({
                'Authorization': `Bearer ${token}`
            });
            return this.http.get<Evento[]>(`${appSettings.apiGeneral}/equiposEvento/listar/${id}`, { headers });
        }

    delete(idequipo:number,idevento:number, token :string): Observable<ResponseAPI>{
        const headers = new HttpHeaders({
                'Authorization': `Bearer ${token}`
            });
            return this.http.delete<ResponseAPI>(`${appSettings.apiGeneral}/desasociarEquipo/${idequipo}/${idevento}`, { headers });
    }
    }
