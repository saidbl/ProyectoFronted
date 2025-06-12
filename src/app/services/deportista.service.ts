import { Injectable,inject } from "@angular/core";
import { HttpClient, HttpHeaders} from "@angular/common/http";
import { appSettings } from "../settings/appSettings";
import { Observable } from "rxjs";
import { Deportista } from "../models/deportista.model";
import { Rutina } from "../models/rutina.model";
import { DeportistaRendimiento } from "../models/deportistaRendimiento.model";
import { ResumenAtletasDTO } from "../models/resumenAtletasDTO.model";
import { controllers } from "chart.js";
@Injectable({
    providedIn:"root"
})
export class DeportistaService{
    deportistas:Deportista[]=[]
    private http=inject(HttpClient)
    private apiLog:string=appSettings.apiLogin

    add(token:string, formData:FormData): Observable<Deportista> {
        console.log(token)
          const headers = new HttpHeaders({
                        'Authorization': `Bearer ${token}`
                    });
        return this.http.post<Deportista>(`${appSettings.apiGeneral}/deportista/agregar`, formData,{headers});
    
        }

    login (email:string, password:string):Observable<any>{
            return this.http.post<any>(this.apiLog,{email,password})
    }

    list( id: number,token: string): Observable<Deportista[]> {
            const headers = new HttpHeaders({
                'Authorization': `Bearer ${token}`
            });
            return this.http.get<Deportista[]>(`${appSettings.apiDeportistas}?id=${id}`, { headers });
        }
    listCheckRenObj( id: number,token: string): Observable<DeportistaRendimiento[]> {
            const headers = new HttpHeaders({
                'Authorization': `Bearer ${token}`
            });
            return this.http.get<DeportistaRendimiento[]>(`${appSettings.apiDeportistas}/CheckRendObj?id=${id}`, { headers });
        }
    getResumenAtletas(instructorId: number, token : string): Observable<ResumenAtletasDTO> {
        const headers = new HttpHeaders({
                'Authorization': `Bearer ${token}`
            });
      return this.http.get<ResumenAtletasDTO>(`${appSettings.apiDeportistas}/resumen/${instructorId}`,{headers});
    }
    getDeportistaById(id:number,token:string):Observable<Deportista>{
        const headers = new HttpHeaders({
                            'Authorization': `Bearer ${token}`
                        });
                  return this.http.get<Deportista>(`${appSettings.apiGeneral}/deportista/getById/${id}`,{headers})
      }
    updateDeportista(id: number, token : string,formData: FormData): Observable<any> {
      const headers = new HttpHeaders({
                    'Authorization': `Bearer ${token}`
                });
    return this.http.put(`${appSettings.apiGeneral}/deportista/editar/${id}`, formData,{headers});
  }

      logOut():void{
        if(typeof localStorage!=="undefined"){
            localStorage.removeItem("token")
            localStorage.removeItem("rol")
        }
      }

      isAuthenticated():boolean{
        if(typeof localStorage != "undefined"){
            const token=localStorage.getItem("token");
            return !!token
        }
        return false
      }

      isDeportista():boolean{
        if(typeof localStorage != "undefined"){
            const rol=localStorage.getItem("rol");
            return rol==="DEPORTISTA"
        }
        return false
      }

}
