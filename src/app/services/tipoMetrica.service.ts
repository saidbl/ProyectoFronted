import { HttpClient, HttpHeaders } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { appSettings } from "../settings/appSettings";
import { RutinaJugador } from "../models/rutinajugador.model";
import { RutinaJugadorDTO } from "../models/rutinaJugadorDTO.model";
import { TipoMetrica } from "../models/tipoMetrica.model";
import { TipoMetricaDTO } from "../models/tipoMetricaDTO.model";
import { ResponseAPI } from "../models/ResponseAPI";

@Injectable({
    providedIn:"root"
})
export class TipoMetricaService{

    private http=inject(HttpClient)

    list(id: number, token: string): Observable<TipoMetrica[]> {
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
        return this.http.get<TipoMetrica[]>(`${appSettings.apiMetricasJugador}/${id}`, { headers });
    }
    add(metrica:TipoMetricaDTO, token: string):Observable<TipoMetrica>{
            const headers = new HttpHeaders({
                'Authorization': `Bearer ${token}`
            });
            return this.http.post<TipoMetrica>(`${appSettings.apiAgregarMetrica}`,metrica,{ headers })
    }
    delete(id:number,token:string): Observable<ResponseAPI>{
        const headers = new HttpHeaders({
                'Authorization': `Bearer ${token}`
            });
            return this.http.delete<ResponseAPI>(`${appSettings.apiGeneral}/eliminarMetrica/${id}`,{ headers })
    }
}