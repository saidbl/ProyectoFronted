import { HttpClient, HttpHeaders } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { appSettings } from "../settings/appSettings";
import { Rutina } from "../models/rutina.model";
import { ResponseAPI } from "../models/ResponseAPI";
import { RutinaDTO } from "../models/rutinaDTO.model";
import { RutinaDTOR } from "../models/rutinaDTOr.model";

@Injectable({
    providedIn:"root"
})
export class RutinaService{

    private http=inject(HttpClient)

    list(id: number, token: string): Observable<Rutina[]> {
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
        return this.http.get<Rutina[]>(`${appSettings.apiRutinas}?id=${id}`, { headers });
    }
    delete(id: number, token: string): Observable<ResponseAPI>{
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
        return this.http.delete<ResponseAPI>(`${appSettings.apiEliminarRutinas}/${id}`,{ headers })
    }
    add(rutina:RutinaDTO, token: string):Observable<Rutina>{
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
        console.log(rutina.objetivo)
        return this.http.post<Rutina>(`${appSettings.apiAgregarRutinas}`,rutina,{ headers })
    }
    edit(id:number,rutina:RutinaDTO, token: string):Observable<Rutina>{
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
        return this.http.put<Rutina>(`${appSettings.apiRutinas}/editar/${id}`,rutina,{ headers })
    }
    getTotalRutinasByInstructorId(instructorId: number, token:string): Observable<number> {
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
        return this.http.get<number>(`${appSettings.apiRutinasInst}/${instructorId}`,{ headers });
      }

      getTop3RutinasByInstructor(instructorId: number, token: string): Observable<Rutina[]>{
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
        return this.http.get<Rutina[]>(`${appSettings.apiRutinas}/${instructorId}/top3`, { headers });
      }

      getRutinasEjerciciosRecursos(deportistaid: number, token: string): Observable<RutinaDTOR[]>{
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
        return this.http.get<RutinaDTOR[]>(`${appSettings.apiRutinasEjerciciosRecursos}/${deportistaid}`,{ headers })
      }
      getRutinasByEjerciciosAndDia(deportistaid: number, token: string): Observable<RutinaDTOR[]>{
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
        return this.http.get<RutinaDTOR[]>(`${appSettings.apiDeportistaRutina}/${deportistaid}`,{ headers })
      }
}