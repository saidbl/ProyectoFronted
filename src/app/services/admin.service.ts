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
export class AdminService{
    private http=inject(HttpClient)
    private apiLog:string=appSettings.apiLogin


    login (email:string, password:string):Observable<any>{
            return this.http.post<any>(appSettings.apiLoginAdmin,{email,password})
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

      isAdmin():boolean{
        if(typeof localStorage != "undefined"){
            const rol=localStorage.getItem("rol");
            return rol==="ADMIN"
        }
        return false
      }

}
