import { Injectable,inject } from "@angular/core";
import { HttpClient, HttpHeaders} from "@angular/common/http";
import { appSettings } from "../settings/appSettings";
import { Observable } from "rxjs";
import { Equipo } from "../models/equipo.model";
import { ResponseAPI } from "../models/ResponseAPI";
import { EquipoDTO } from "../models/equipoDTO.model";
@Injectable({
    providedIn:"root"
})
export class EquipoService{
    private http=inject(HttpClient)

    list( id: number,token: string): Observable<Equipo[]> {
            const headers = new HttpHeaders({
                'Authorization': `Bearer ${token}`
            });
            return this.http.get<Equipo[]>(`${appSettings.apiEquipo}?id=${id}`, { headers });
        }
    delete(id: number, token: string): Observable<ResponseAPI>{
            const headers = new HttpHeaders({
                'Authorization': `Bearer ${token}`
            });
            return this.http.delete<ResponseAPI>(`${appSettings.apiEliminarEquipos}/${id}`,{ headers })
        }
    add(equipo:EquipoDTO, token: string, archivo:File):Observable<Equipo>{
            const headers = new HttpHeaders({
                'Authorization': `Bearer ${token}`
            });
            const formData = new FormData();
        formData.append('archivo', archivo);
        console.log(archivo)
        const equipoBlob = new Blob([JSON.stringify(equipo)], { type: 'application/json' });
        formData.append('equipo', equipoBlob);
            return this.http.post<Equipo>(`${appSettings.apiAgregarEquipos}`,formData,{ headers })
        }
    update(equipoDTO: EquipoDTO, token: string, imagen?: File): Observable<any> {
    const formData = new FormData();
    formData.append('equipo', new Blob([JSON.stringify(equipoDTO)], {
      type: 'application/json'
    }));
    if (imagen) {
      formData.append('imagen', imagen);
    }
    return this.http.put(`${appSettings.apiActualizarEquipo}/${equipoDTO.id}`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

    listByIdDeportista( id: number,token: string): Observable<Equipo[]> {
            const headers = new HttpHeaders({
                'Authorization': `Bearer ${token}`
            });
            return this.http.get<Equipo[]>(`${appSettings.apiEquipoDeportista}/${id}`, { headers });
        }
}
