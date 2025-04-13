import { Injectable,inject } from "@angular/core";
import { HttpClient, HttpHeaders} from "@angular/common/http";
import { appSettings } from "../settings/appSettings";
import { Observable } from "rxjs";
import { JugadorEquipo } from "../models/jugadorEquipo.model";
import { JugadorEquipoDTO } from "../models/jugadorEquipoDTO.model";
@Injectable({
    providedIn:"root"
})
export class JugadorEquipoService{
    private http=inject(HttpClient)

    list( id: number,token: string): Observable<JugadorEquipo[]> {
            const headers = new HttpHeaders({
                'Authorization': `Bearer ${token}`
            });
            return this.http.get<JugadorEquipo[]>(`${appSettings.apiJugadorEquipo}?id=${id}`, { headers });
        }
    add(jugadorequipo:JugadorEquipoDTO, token: string):Observable<JugadorEquipo>{
                const headers = new HttpHeaders({
                    'Authorization': `Bearer ${token}`
                });
                console.log(jugadorequipo.idJugador)
                console.log(jugadorequipo.idEquipo)
                return this.http.post<JugadorEquipo>(`${appSettings.apiVincularEquipo}`,jugadorequipo,{ headers })
        }
}
