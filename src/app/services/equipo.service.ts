import { Injectable,inject } from "@angular/core";
import { HttpClient, HttpHeaders} from "@angular/common/http";
import { appSettings } from "../settings/appSettings";
import { Observable } from "rxjs";
import { Equipo } from "../models/equipo.model";
import { ResponseAPI } from "../models/ResponseAPI";
import { EquipoDTO } from "../models/equipoDTO.model";
@Injectable({
    providedIn:"root"
})
export class EquipoService{
    private http=inject(HttpClient)

    list( id: number,token: string): Observable<Equipo[]> {
            const headers = new HttpHeaders({
                'Authorization': `Bearer ${token}`
            });
            return this.http.get<Equipo[]>(`${appSettings.apiEquipo}?id=${id}`, { headers });
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

    listByIdDeportista( id: number,token: string): Observable<Equipo[]> {
            const headers = new HttpHeaders({
                'Authorization': `Bearer ${token}`
            });
            return this.http.get<Equipo[]>(`${appSettings.apiEquipoDeportista}/${id}`, { headers });
        }
}
