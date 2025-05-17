import { Injectable,inject } from "@angular/core";
import { HttpClient, HttpParams, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { RecursoRutina } from "../models/recursoRutina.model";
import { ResponseAPI } from "../models/ResponseAPI";
@Injectable({
    providedIn:"root"
})
export class RecursoService {
    private apiUrl = 'http://localhost:8080/api/recursos';
  
    private http=inject(HttpClient)
  
    subirRecurso(ejercicioId: number, archivo: File,  token:string, descripcion?: string): Observable<RecursoRutina> {
      const headers = new HttpHeaders({
                      'Authorization': `Bearer ${token}`
      });
      const formData = new FormData();
      formData.append('archivo', archivo);
      if (descripcion) formData.append('descripcion', descripcion);
      return this.http.post<RecursoRutina>(`${this.apiUrl}/ejercicio/${ejercicioId}`, formData,{ headers });
    }
  
    obtenerRecursos(ejercicioId: number, token : string,tipo?: 'VIDEO' | 'IMAGEN' | 'PDF'): Observable<RecursoRutina[]> {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });
      let params = new HttpParams();
      if (tipo) params = params.set('tipo', tipo);
      return this.http.get<RecursoRutina[]>(`${this.apiUrl}/ejercicio/${ejercicioId}`, { params });
    }
    obtenerTodosRecursos(instructorId:number,token : string): Observable<RecursoRutina[]> {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });
      return this.http.get<RecursoRutina[]>(`${this.apiUrl}/ejercicio/videos/${instructorId}`, { headers });
    }
    eliminar(id :number, token : string ):Observable<ResponseAPI>{
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });
      return this.http.delete<ResponseAPI>(`${this.apiUrl}/ejercicio/eliminar/${id}`, { headers });
    }
  }
  