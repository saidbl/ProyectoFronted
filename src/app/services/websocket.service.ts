import { Injectable } from '@angular/core';
import { Client, Message } from '@stomp/stompjs';
import { Subject, Observable } from 'rxjs';
import { MensajeDTO } from '../models/mensajeDTO.model';

@Injectable({
  providedIn: 'root'
})
export class WsService {
  private client: Client;
  private messageSubject = new Subject<MensajeDTO>();
  private connected = false;

  constructor() {
    this.client = new Client({
        brokerURL: 'http://localhost:8080/ws', 
        webSocketFactory: () => new WebSocket('ws://localhost:8080/ws'),
        reconnectDelay: 5000,
        debug: (str) => console.log('STOMP: ', str), 
    });

    this.client.onConnect = () => {
      this.connected = true;
      console.log('STOMP conectado');
      this.client.subscribe('/topic/mensajes', (msg: Message) => {
        const body = JSON.parse(msg.body);
        this.messageSubject.next(body);
      });
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
}
