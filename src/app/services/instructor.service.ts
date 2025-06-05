import { Injectable,inject } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { appSettings } from "../settings/appSettings";
import { Observable } from "rxjs";
import { Instructor } from "../models/instructor.model";
import { InstructorDTO } from "../models/instructorDTO.model";
@Injectable({
    providedIn:"root"
})
export class InstructorService{
    private http=inject(HttpClient)
    private apiLog:string=appSettings.apiLoginInst

    login (email:string, password:string):Observable<any>{
            return this.http.post<any>(this.apiLog,{email,password})
    }

    getInstructorById(id:number, token:string): Observable<Instructor>{
      const headers = new HttpHeaders({
                    'Authorization': `Bearer ${token}`
                });
          return this.http.get<Instructor>(`${appSettings.apiGeneral}/instructor/${id}`,{headers})
    }
     updateInstructor(id: number, token : string,formData: FormData): Observable<any> {
      const headers = new HttpHeaders({
                    'Authorization': `Bearer ${token}`
                });
    return this.http.put(`${appSettings.apiGeneral}/instructor/editar/${id}`, formData,{headers});
  }
  list( id: number,token: string): Observable<Instructor> {
              const headers = new HttpHeaders({
                  'Authorization': `Bearer ${token}`
              });
              return this.http.get<Instructor>(`${appSettings.apiGeneral}/instructores?id=${id}`, { headers });
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
