import { Injectable,inject } from "@angular/core";
import { HttpClient, HttpHeaders} from "@angular/common/http";
import { appSettings } from "../settings/appSettings";
import { Observable } from "rxjs";
import { Deportista } from "../models/deportista.model";
import { Deporte } from "../models/deporte.model";

@Injectable({
    providedIn:"root"
})
export class DeporteService{
    deportistas:Deportista[]=[]
    private http=inject(HttpClient)
    private apiLog:string=appSettings.apiLogin

    list(token: string): Observable<Deporte[]> {
            const headers = new HttpHeaders({
                'Authorization': `Bearer ${token}`
            });
            return this.http.get<Deporte[]>(`${appSettings.apiDeportes}`, { headers });
        }
    }