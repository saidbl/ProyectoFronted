import { Injectable,inject } from "@angular/core";
import { HttpClient, HttpHeaders} from "@angular/common/http";
import { appSettings } from "../settings/appSettings";
import { Observable, catchError, map, throwError } from 'rxjs';
import { ResponseAPI } from "../models/ResponseAPI";
import { Evento } from "../models/evento.model";
import { EventoDTO } from "../models/eventoDTO.model";
import { EventoConEquipos } from "../models/eventoconEquipos.model";
@Injectable({
    providedIn:"root"
})
export class EventoService{
    private http=inject(HttpClient)
    list( id: number,token: string): Observable<Evento[]> {
            const headers = new HttpHeaders({
                'Authorization': `Bearer ${token}`
            });
            return this.http.get<Evento[]>(`${appSettings.apiEventoEquipo}?id=${id}`, { headers });
        }
    delete(id: number, token: string): Observable<ResponseAPI>{
            const headers = new HttpHeaders({
                'Authorization': `Bearer ${token}`
            });
            return this.http.delete<ResponseAPI>(`${appSettings.apiEliminarEventos}/${id}`,{ headers })
        }
    actualizarEvento(idEvento: number, evento: EventoDTO,token:string): Observable<Evento> {
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
        console.log(evento)
        if (evento.diasSemana && typeof evento.diasSemana === 'string') {
            evento.diasSemana = (evento.diasSemana as string)
              .split(',');
          } else if (!evento.diasSemana) {
            evento.diasSemana = [];
          }
        
        const formData = new FormData();
        const eventoBlob = new Blob([JSON.stringify(evento)], { type: 'application/json' });
        formData.append('evento', eventoBlob);
        console.log(formData.get("evento"))
        return this.http.put<Evento>(`${appSettings.apiActualizarEvento}/${idEvento}`, formData,{ headers });
    }
    listEventosByDeportista(id : number, token : string):Observable<Evento[]>{
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
        return this.http.get<Evento[]>(`${appSettings.apiEventosFuturosDep}/${id}`,{ headers })
    }
    addEvento(evento:EventoDTO,token:string, archivo: File):Observable<Evento>{
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
        const formData = new FormData();
        formData.append('archivo', archivo);
        const eventoBlob = new Blob([JSON.stringify(evento)], { type: 'application/json' });
        formData.append('evento', eventoBlob);
        return this.http.post<Evento>(`${appSettings.apiAgregarEvento}`,formData,{ headers })
    }
    listEventosByOrganizacion(id : number, token : string):Observable<Evento[]>{
        console.log(appSettings.apiEventosFuturosOrg)
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
        return this.http.get<Evento[]>(`${appSettings.apiEventosFuturosOrg}/${id}`,{ headers })
    }
    
    getProximosEventosConEquipos(id:number, token:string): Observable<EventoConEquipos[]> {
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
        return this.http.get<EventoConEquipos[]>(`${appSettings.apiProximosEquipos}/${id}`,{ headers });
      }
    getEstadisticasGenerales(token:string): Observable<any> {
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
          return this.http.get(`${appSettings.apiGeneral}/generalesorg`,{ headers }).pipe(
            map((response: any) => this.transformStatsData(response)),
            catchError(this.handleError)
          );
    }
    private transformStatsData(data: any): any {
        return {
          eventosPorMes: data.eventosPorMes || [],
          participacionEventos: data.participacionEventos || [],
          jugadoresPorDeporte: data.jugadoresPorDeporte || [],
          equiposActivosInactivos: data.equiposActivosInactivos || [],
          asistenciasRutinas: data.asistenciasRutinas || []
        };
      }

      private handleError(error: any) {
        console.error('Error en EstadisticasService:', error);
        let errorMessage = 'Error al cargar estadísticas';
        if (error.error instanceof ErrorEvent) {
          errorMessage = `Error: ${error.error.message}`;
        } else {
          errorMessage = `Código: ${error.status}\nMensaje: ${error.message}`;
        }
        return throwError(() => new Error(errorMessage));
      }
}