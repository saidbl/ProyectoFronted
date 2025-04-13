import { Injectable,inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { appSettings } from "../settings/appSettings";
import { Observable } from "rxjs";
import { Organizacion } from "../models/organizacion.model";
@Injectable({
    providedIn:"root"
})
export class OrganizacionService{
    organizaciones:Organizacion[]=[]
    private http=inject(HttpClient)
    private apiLog:string=appSettings.apiLoginOrg

    login (email:string, password:string):Observable<any>{
            return this.http.post<any>(this.apiLog,{email,password})
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

      isOrganizacion():boolean{
        if(typeof localStorage != "undefined"){
            const rol=localStorage.getItem("rol");
            return rol==="ORGANIZACION"
        }
        return false
      }
}
