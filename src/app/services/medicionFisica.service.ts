import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { catchError, Observable, throwError } from "rxjs";
import { appSettings } from "../settings/appSettings";
import { EvolucionFisicaDTO } from "../models/evolucionFisicaDTO.model";

@Injectable({
    providedIn:"root"
})
export class MedicionFisicaService{

    private http=inject(HttpClient)

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