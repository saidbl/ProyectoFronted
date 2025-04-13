import { Injectable,inject } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { appSettings } from "../settings/appSettings";
import { Observable } from "rxjs";
import { Posicion } from "../models/posicion.model";
@Injectable({
    providedIn:"root"
})
export class PosicionService{
    private http=inject(HttpClient)
    
    list(id: number, token: string): Observable<Posicion[]> {
    const headers = new HttpHeaders({
                'Authorization': `Bearer ${token}`
    });
        return this.http.get<Posicion[]>(`${appSettings.apiPosiciones}?id=${id}`, { headers });
    }
    
}
