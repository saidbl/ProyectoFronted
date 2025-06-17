import { Injectable,inject } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { appSettings } from "../settings/appSettings";
import { Observable } from "rxjs";
import { Organizacion } from "../models/organizacion.model";
import { OrganizacionDTO } from "../models/organizacionDTO.model";
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
    getbyId(id: number, token: string):Observable<Organizacion>{
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });
      return this.http.get<Organizacion>(`${appSettings.apiGeneral}/obtenerOrg/${id}`,{headers})
    }
    getbyDeporte(id: number, token: string):Observable<Organizacion[]>{
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });
      return this.http.get<Organizacion[]>(`${appSettings.apiGeneral}/listarOrganizacion/${id}`,{headers})
    }

    update(idOrg: number,token:string,formData: FormData): Observable<any> {
            const headers = new HttpHeaders({
                'Authorization': `Bearer ${token}`
            });
            return this.http.put<Organizacion>(`${appSettings.apiActualizarOrg}/${idOrg}`, formData,{ headers });
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
