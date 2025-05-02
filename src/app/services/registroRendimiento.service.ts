import { HttpClient, HttpHeaders } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { appSettings } from "../settings/appSettings";
import { RegistroRendimiento } from "../models/registroRendimiento.model";
import { RegistroRendimientoDTO } from "../models/registroRendimientoDTO.model";

@Injectable({
    providedIn:"root"
})
export class RegistroRendimientoService{

    private http=inject(HttpClient)

    list(id: number, token: string): Observable<RegistroRendimiento[]> {
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
        return this.http.get<RegistroRendimiento[]>(`${appSettings.apiRecordsJugador}/${id}`, { headers });
    }
    add(rr:RegistroRendimientoDTO, token: string):Observable<RegistroRendimiento>{
            const headers = new HttpHeaders({
                'Authorization': `Bearer ${token}`
            });
            return this.http.post<RegistroRendimiento>(`${appSettings.apiAgregarRecord}`,rr,{ headers })
    }
}