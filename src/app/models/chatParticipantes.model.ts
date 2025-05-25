
import { Chat } from './chat.model';
import { Deportista } from './deportista.model';

export class ChatParticipantes {
  id?: number;            
  chat?: Chat;              
  deportista?: Deportista;  

  constructor(chat?: Chat, deportista?: Deportista, id?: number) {
    this.chat = chat;
    this.deportista = deportista;
    if (id) {
      this.id = id;
    }
  }
}
