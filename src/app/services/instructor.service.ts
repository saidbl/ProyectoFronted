import { Injectable,inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { appSettings } from "../settings/appSettings";
import { Observable } from "rxjs";
import { Instructor } from "../models/instructor.model";
@Injectable({
    providedIn:"root"
})
export class InstructorService{
    instructores: Instructor[]=[]
    private http=inject(HttpClient)
    private apiLog:string=appSettings.apiLoginInst

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

      isInstructor():boolean{
        if(typeof localStorage != "undefined"){
            const rol=localStorage.getItem("rol");
            return rol==="INSTRUCTOR"
        }
        return false
      }
}
