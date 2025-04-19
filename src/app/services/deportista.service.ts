import { Injectable,inject } from "@angular/core";
import { HttpClient, HttpHeaders} from "@angular/common/http";
import { appSettings } from "../settings/appSettings";
import { Observable } from "rxjs";
import { Deportista } from "../models/deportista.model";
import { Rutina } from "../models/rutina.model";
@Injectable({
    providedIn:"root"
})
export class DeportistaService{
    deportistas:Deportista[]=[]
    private http=inject(HttpClient)
    private apiLog:string=appSettings.apiLogin

    login (email:string, password:string):Observable<any>{
            return this.http.post<any>(this.apiLog,{email,password})
    }

    list( id: number,token: string): Observable<Deportista[]> {
            const headers = new HttpHeaders({
                'Authorization': `Bearer ${token}`
            });
            return this.http.get<Deportista[]>(`${appSettings.apiDeportistas}?id=${id}`, { headers });
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
