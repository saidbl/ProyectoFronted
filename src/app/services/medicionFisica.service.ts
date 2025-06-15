import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { catchError, Observable, throwError } from "rxjs";
import { appSettings } from "../settings/appSettings";
import { EvolucionFisicaDTO } from "../models/evolucionFisicaDTO.model";
import { MedicionFisica } from "../models/medicionFisica.model";
import { MedicionFisicaDTO } from "../models/medicionFisicaDTO.model";
import { ResponseAPI } from "../models/ResponseAPI";

@Injectable({
    providedIn:"root"
})
export class MedicionFisicaService{

    private http=inject(HttpClient)

    add(mf:MedicionFisicaDTO, token:string): Observable<MedicionFisica>{
       const headers = new HttpHeaders({
                      'Authorization': `Bearer ${token}`
                  });
                  return this.http.post<MedicionFisica>(`${appSettings.apiGeneral}/addMedicion`,mf,{ headers })
    }
    list(id:number, token: string):Observable<MedicionFisica[]>{
      const headers = new HttpHeaders({
                      'Authorization': `Bearer ${token}`
                  });
                  return this.http.get<MedicionFisica[]>(`${appSettings.apiGeneral}/listMedicion/${id}`,{ headers })
    }

    eliminar(id:number,token:string):Observable<ResponseAPI>{
      const headers = new HttpHeaders({
                      'Authorization': `Bearer ${token}`
                  });
                  return this.http.delete<ResponseAPI>(`${appSettings.apiGeneral}/deleteMedicion/${id}`,{ headers })
    }
    obtenerUltimaMedicion(deportistaId: number, token:string): Observable<MedicionFisica> {
      const headers = new HttpHeaders({
                      'Authorization': `Bearer ${token}`
                  });
    return this.http.get<MedicionFisica>(`${appSettings.apiGeneral}/ultimaMedicion/${deportistaId}`, {headers});
  }

    getEvolucionFisica(deportistaId: number, rango: string,token:string): Observable<EvolucionFisicaDTO[]> {
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
        return this.http.get<EvolucionFisicaDTO[]>(
          `${appSettings.apiEvolucion}/${deportistaId}?rango=${rango}`,{headers}
        ).pipe(
          catchError(this.handleError)
        );
      }
    
      private handleError(error: HttpErrorResponse) {
        let errorMessage = 'Error desconocido';
        if (error.error instanceof ErrorEvent) {
          errorMessage = `Error: ${error.error.message}`;
        } else {
          errorMessage = error.error?.message || error.statusText;
        }
        console.error(error);
        return throwError(() => new Error(errorMessage));
      }
    }