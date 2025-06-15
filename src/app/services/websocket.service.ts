import { Injectable } from '@angular/core';
import { Client, Message } from '@stomp/stompjs';
import { Subject, Observable, BehaviorSubject } from 'rxjs';
import { MensajeDTO } from '../models/mensajeDTO.model';
import { RemitenteTipo } from '../models/remitentetipo.model';

@Injectable({
  providedIn: 'root'
})
export class WsService {
  private client: Client;
  private messageSubject = new Subject<MensajeDTO>();
  private connected = false;
  public connectionEstablished = new BehaviorSubject<boolean>(false);
private notificationCount = 0;
private notificacionesPorChat = new Map<number, MensajeDTO[]>();
  private notificacionPorChatSubject = new BehaviorSubject<Map<number, MensajeDTO[]>>(new Map());
  private notificationSubject = new BehaviorSubject<number>(0);
  constructor() {
    this.client = new Client({
        brokerURL: 'http://localhost:8080/ws', 
        webSocketFactory: () => new WebSocket('ws://localhost:8080/ws'),
        reconnectDelay: 5000,
        debug: (str) => console.log('STOMP: ', str), 
    });

    this.client.onConnect = () => {
      this.connectionEstablished.next(true);
      this.connected = true;
      this.subscribeToNotificaciones(); 
      console.log('STOMP conectado');
this.client.subscribe('/topic/mensajes', (msg: Message) => {
  let body;
  console.log(msg)
  try {
    body = JSON.parse(msg.body);
    console.log('Mensaje recibido:', body);
  } catch {
    body = msg.body;
  }
   if (typeof body === 'string' && body === "nuevo") {
    this.incrementNotificationCount();
  }
});
;
  setTimeout(() => {
        this.connectionEstablished.next(true);
        console.log('Conexión completamente establecida con suscripciones');
      }, 100); 
    };
    
    this.client.onStompError = (frame) => {
      console.error('Error STOMP:', frame.headers['message']);
      console.error('Detalles:', frame.body);
    };

    this.client.onDisconnect = () => {
      this.connected = false;
      console.log('STOMP desconectado');
    };
    
  }

  subscribeToChat(chatId: number) {
  this.client.subscribe(`/topic/chat/${chatId}`, (msg: Message) => {
    const body = JSON.parse(msg.body);
    this.messageSubject.next(body);
  });
  
}
getConnectionStatus(): Observable<boolean> {
  return this.connectionEstablished.asObservable();
}


resetNotificationCount() {
  this.notificationCount = 0;
  this.notificationSubject.next(0);
}

incrementNotificationCount() {
  this.notificationCount++;
  this.notificationSubject.next(this.notificationCount);
}

getNotificationCount(): Observable<number> {
  return this.notificationSubject.asObservable();
}
  connect(): Observable<MensajeDTO> {
    this.client.activate();
    return this.messageSubject.asObservable();
  }

  sendMessage(message: MensajeDTO): void {
        if (this.client.connected) {
            this.client.publish({
                destination: '/app/chat.send',
                body: JSON.stringify(message)
            });
        } else {
            console.error('No conectado al WebSocket');
        }
    }
    get isConnected$(): Observable<boolean> {
    return this.connectionEstablished.asObservable();
  }
 subscribeToNotificaciones() {
  const tipo = localStorage.getItem("rol")?.toLowerCase();  
  const currentUserId = localStorage.getItem('id');
  if (!tipo || !currentUserId) return;
  this.client.subscribe(`/topic/notificaciones/${tipo}/${currentUserId}`, (msg: Message) => {
    const mensaje: MensajeDTO = JSON.parse(msg.body);
    const chatId = mensaje.idChat;
    const mismoId = mensaje.remitenteId === Number(currentUserId);
    const mismoRol = mensaje.remitenteTipo.toLowerCase() === tipo;
    if (!(mismoId && mismoRol)) {
      const notificacionesActuales = this.notificacionesPorChat.get(chatId) || [];
      this.notificacionesPorChat.set(chatId, [...notificacionesActuales, mensaje]);
      this.notificacionPorChatSubject.next(new Map(this.notificacionesPorChat));
      console.log("Notificación recibida:", mensaje);
    } else {
      console.log("Mensaje descartado: mismo id y mismo rol");
    }
  });
}


getNotificacionesPorChat(): Observable<Map<number, MensajeDTO[]>> {
  return this.notificacionPorChatSubject.asObservable();
}

getTotalNotificaciones(): number {
  let total = 0;
  this.notificacionesPorChat.forEach(lista => total += lista.length);
  return total;
}

limpiarNotificacionesDeChat(chatId: number) {
    if (this.notificacionesPorChat.has(chatId)) {
      this.notificacionesPorChat.delete(chatId);
      this.notificacionPorChatSubject.next(new Map(this.notificacionesPorChat));
    }
  }
}
