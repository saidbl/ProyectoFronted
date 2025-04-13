import { Injectable,inject } from "@angular/core";
import { HttpClient, HttpParams, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { RecursoRutina } from "../models/recursoRutina.model";
import { appSettings } from "../settings/appSettings";
import { EjercicioRutina } from "../models/ejercicioRutina.model";
import { EjercicioRutinaDTO } from "../models/ejercicioRutinaDTO.model";
import { ResponseAPI } from "../models/ResponseAPI";
@Injectable({
    providedIn:"root"
})
export class EjercicioRutinaService {
    private http=inject(HttpClient)
  
    obtenerEjercicios(token : string,idInstructor: number): Observable<EjercicioRutina[]> {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });
      return this.http.get<EjercicioRutina[]>(`${appSettings.apiEjercicios}?id=${idInstructor}`,{headers});
    }

    add(ejercicio:EjercicioRutinaDTO, token: string):Observable<EjercicioRutina>{
                const headers = new HttpHeaders({
                    'Authorization': `Bearer ${token}`
                });
                return this.http.post<EjercicioRutina>(`${appSettings.apiAgregarEjercicio}`,ejercicio,{ headers })
            }

     delete(id: number, token: string): Observable<ResponseAPI>{
                const headers = new HttpHeaders({
                    'Authorization': `Bearer ${token}`
                });
                return this.http.delete<ResponseAPI>(`${appSettings.apiEliminarEjercicios}/${id}`,{ headers })
            }

  }
  