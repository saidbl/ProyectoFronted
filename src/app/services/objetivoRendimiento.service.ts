import { HttpClient, HttpHeaders } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { appSettings } from "../settings/appSettings";
import { RegistroRendimiento } from "../models/registroRendimiento.model";
import { RegistroRendimientoDTO } from "../models/registroRendimientoDTO.model";
import { ObjetivoRendimiento } from "../models/objetivoRendimiento.model";
import { ObjetivoRendimientoDTO } from "../models/objetivoRendimientoDTO.model";

@Injectable({
    providedIn:"root"
})
export class ObjetivoRendimientoService{

    private http=inject(HttpClient)

    list(id: number, token: string): Observable<ObjetivoRendimiento[]> {
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
        return this.http.get<ObjetivoRendimiento[]>(`${appSettings.apiGoalsJugador}/${id}`, { headers });
    }
    add(rr:ObjetivoRendimientoDTO, token: string):Observable<ObjetivoRendimiento>{
            const headers = new HttpHeaders({
                'Authorization': `Bearer ${token}`
            });
            return this.http.post<ObjetivoRendimiento>(`${appSettings.apiAgregarGoal}`,rr,{ headers })
    }
}