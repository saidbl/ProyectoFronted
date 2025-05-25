import { Injectable,inject } from "@angular/core";
import { appSettings } from "../settings/appSettings";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { Chat } from "../models/chat.model";
import { ChatRequest } from "./chatRequest.model";
import { MensajeDTO } from "../models/mensajeDTO.model";
@Injectable({
    providedIn:"root"
})
export class ChatService {
  private apiUrl = `${appSettings.apiGeneral}`;
   private http=inject(HttpClient)

  getChats(token : string, rol:string, id :number): Observable<Chat[]> {
     const headers = new HttpHeaders({
                    'Authorization': `Bearer ${token}`
                });
    return this.http.get<Chat[]>(`${this.apiUrl}/usuario/${id}?tipoUsuario=${rol}`,{headers});
  }

  createChat(token : string ,chatData: ChatRequest): Observable<Chat> {
     const headers = new HttpHeaders({
                    'Authorization': `Bearer ${token}`
                });
    return this.http.post<Chat>(`${this.apiUrl}/usuario/crear`, chatData,{headers});
  }
  getMessages(token: string, chatId: number): Observable<MensajeDTO[]> {
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  return this.http.get<MensajeDTO[]>(`${this.apiUrl}/chats/${chatId}/messages`, { headers });
}

markAsRead(token: string, chatId: number): Observable<void> {
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  return this.http.put<void>(`${this.apiUrl}/chats/${chatId}/read`, {}, { headers });
}
}