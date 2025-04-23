import { Injectable,inject } from "@angular/core";
import { HttpClient, HttpHeaders} from "@angular/common/http";
import { appSettings } from "../settings/appSettings";
import { Observable } from "rxjs";
import { JugadorEquipo } from "../models/jugadorEquipo.model";
import { JugadorEquipoDTO } from "../models/jugadorEquipoDTO.model";
import { EventoEquipo } from "../models/eventoEquipo.model";
import { EventoEquipoDTO } from "../models/eventoEquipoDTO.model";
import { EventoFecha } from "../models/eventoFecha.model";
@Injectable({
    providedIn:"root"
})
export class EventoFechaService{
    private http=inject(HttpClient)

    list( id: number,token: string): Observable<EventoFecha[]> {
            const headers = new HttpHeaders({
                'Authorization': `Bearer ${token}`
            });
            return this.http.get<EventoFecha[]>(`${appSettings.apilistarFechasEvento}/${id}`, { headers });
        }
}
