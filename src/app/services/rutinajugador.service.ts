import { HttpClient, HttpHeaders } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { appSettings } from "../settings/appSettings";
import { RutinaJugador } from "../models/rutinajugador.model";
import { RutinaJugadorDTO } from "../models/rutinaJugadorDTO.model";

@Injectable({
    providedIn:"root"
})
export class RutinaJugadorService{

    private http=inject(HttpClient)

    list(id: number, token: string): Observable<RutinaJugador[]> {
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
        return this.http.get<RutinaJugador[]>(`${appSettings.apiRutinasJugador}?id=${id}`, { headers });
    }
    add(rutina:RutinaJugadorDTO, token: string):Observable<RutinaJugador>{
            const headers = new HttpHeaders({
                'Authorization': `Bearer ${token}`
            });
            console.log(rutina.idJugador)
            return this.http.post<RutinaJugador>(`${appSettings.apiVincularRutinas}`,rutina,{ headers })
    }
}