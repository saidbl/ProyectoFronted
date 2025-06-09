import { Injectable } from '@angular/core';
import { Client, Message } from '@stomp/stompjs';
import { Subject, Observable, BehaviorSubject } from 'rxjs';
import { MensajeDTO } from '../models/mensajeDTO.model';

@Injectable({
  providedIn: 'root'
})
export class WsService {
  private client: Client;
  private messageSubject = new Subject<MensajeDTO>();
  private connected = false;
  public connectionEstablished = new BehaviorSubject<boolean>(false);
private notificationCount = 0;
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
      console.log('STOMP conectado');
this.client.subscribe('/topic/mensajes', (msg: Message) => {
  let body;
  try {
    body = JSON.parse(msg.body);
  } catch {
    body = msg.body;
  }

  const currentUserId = Number(localStorage.getItem('usuarioId'));
  if (body && typeof body === 'object' && body.remitenteId !== currentUserId) {
    this.incrementNotificationCount();
  } else if (typeof body === 'string' && body === 'nuevo') {
    this.incrementNotificationCount();
  }
});


      this.client.subscribe('/topic/chats/updates', (message: Message) => {
    const chatUpdate = JSON.parse(message.body);
    console.log('Nuevo mensaje en chat:', chatUpdate);
  });
  setTimeout(() => {
        this.connectionEstablished.next(true);
        console.log('Conexión completamente establecida con suscripciones');
      }, 100); // 100ms es suficiente para que las suscripciones se procesen
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
}
