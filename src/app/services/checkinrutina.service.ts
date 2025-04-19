import { Injectable,inject } from "@angular/core";
import { HttpClient, HttpParams, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { appSettings } from "../settings/appSettings";
import { CheckInRutinaDTO } from "../models/checkinRutinaDTO.model";
import { CheckInRutina } from "../models/checkinRutina.model";
@Injectable({
    providedIn:"root"
})
export class CheckInRutinaService {
    private http=inject(HttpClient)
  
    add(check:CheckInRutinaDTO, token: string):Observable<CheckInRutina>{
                const headers = new HttpHeaders({
                    'Authorization': `Bearer ${token}`
                });
                console.log(check)
                return this.http.post<CheckInRutina>(`${appSettings.apiAgregarCheckin}`,check,{ headers })
            }

    list(id :  number, token : string ):Observable<CheckInRutina[]>{
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
        return this.http.get<CheckInRutina[]>(`${appSettings.apicompletadas}/${id}`,{ headers })
    }


  }