import { inject, Injectable } from "@angular/core";
import { appSettings } from "../settings/appSettings";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { PaginaMensajes } from "../models/paginaMensajes.model";
@Injectable({
  providedIn: 'root'
})
export class MensajeService {
  private apiUrl = appSettings.apiGeneral;
  private http = inject(HttpClient)

  getMensajesPaginados(chatId: number, page: number, size: number, token : string): Observable<PaginaMensajes> {
    return this.http.get<PaginaMensajes>(
      `${this.apiUrl}/mensajes/${chatId}?page=${page}&size=${size}`
    );
  }
}