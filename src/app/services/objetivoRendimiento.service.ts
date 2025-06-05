import { HttpClient, HttpHeaders } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { appSettings } from "../settings/appSettings";
import { ObjetivoRendimiento } from "../models/objetivoRendimiento.model";
import { ObjetivoRendimientoDTO } from "../models/objetivoRendimientoDTO.model";
import { ProgresoObjetivoDTO } from "../models/progresoObjetivoDTO.model";
import { ResponseAPI } from "../models/ResponseAPI";

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
    getProgresoObjetivos(deportistaId: number,token : string): Observable<ProgresoObjetivoDTO[]> {
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
        return this.http.get<ProgresoObjetivoDTO[]>(
          `${appSettings.apiProgresoObjetivos}/${deportistaId}`,{headers});
      }
    
    completado(id: number, token: string):Observable<ObjetivoRendimiento>{
        console.log()
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
        return this.http.put<ObjetivoRendimiento>(
          `${appSettings.apiGeneral}/completadoGoal/${id}`,{headers});
    }
    eliminar(id:number, token : string):Observable<ResponseAPI>{
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
        return this.http.delete<ResponseAPI>(
          `${appSettings.apiGeneral}/eliminarGoal/${id}`,{headers});
    }
}