import { Component, inject } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { finalize, forkJoin, Subject, takeUntil} from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DeportistaService } from '../../services/deportista.service';
import { EquipoService } from '../../services/equipo.service';
import { ChatTipo } from '../../models/chatTipo.model';
import { Chat } from '../../models/chat.model';
import { MensajeDTO } from '../../models/mensajeDTO.model';
import { WsService } from '../../services/websocket.service';
import { RemitenteTipo } from '../../models/remitentetipo.model';
import { MensajeService } from '../../services/mensaje.service';
import { OrganizacionService } from '../../services/organizacion.service';
import { Mensaje } from '../../models/mensaje.model';
@Component({
  selector: 'app-chat',
  imports: [FormsModule,CommonModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent {
  private cservice = inject(ChatService)
  private wsservice = inject(WsService)
  private eservice = inject(EquipoService)
  private dservice = inject(DeportistaService)
  private mservice = inject(MensajeService)
  private oservice = inject(OrganizacionService)
  chats: any[] = [];
  selectedChat: Chat | null= null;
  messages: any[] = [];
  newMessage = '';
  currentUser: any;
  private destroy$ = new Subject<void>();
  currentPage = 0;
  pageSize = 20;
  totalMessages = 0;
  loadingMessages = false;

  ngOnInit(): void {
    this.wsservice.connect().subscribe((mensaje: MensajeDTO) => {
    this.messages.push(mensaje);
    this.scrollToBottom();
  });
    const idInstructor =Number(localStorage.getItem("id"));
    const token = localStorage.getItem("token")
    const deporte = Number(localStorage.getItem("idDeporte"))
    if(!token) {
            throw new Error("Not Token Found")
          }
    forkJoin({
      deportistas: this.dservice.list(idInstructor,token),
      equipos: this.eservice.list(idInstructor,token),
      organizaciones: this.oservice.getbyDeporte(deporte,token),
    }).subscribe(({ deportistas, equipos, organizaciones }) => {
      const solicitudesChats: any[] = [];
      console.log(deportistas)
      deportistas.forEach(deportista => {
        solicitudesChats.push(
          this.cservice.createChat(token,{
            instructorId: idInstructor,
            deportistaId: deportista.id,
            equipoId: 0,
            organizacionId:0,
            deporteId: deporte,
            tipo: ChatTipo.INSTRUCTOR_DEPORTISTA,
          })
        );
      });
      console.log(solicitudesChats)
      equipos.forEach(equipo => {

        solicitudesChats.push(
          this.cservice.createChat(token,{
            instructorId: idInstructor,
            deportistaId: 0,
            equipoId: equipo.id,
            tipo: ChatTipo.EQUIPO,
            organizacionId:0,
            deporteId: deporte,
          })
        );
      });
      organizaciones.forEach(organizacion => {
        solicitudesChats.push(
          this.cservice.createChat(token,{
            instructorId: idInstructor,
            deportistaId: 0,
            equipoId: 0,
            organizacionId:organizacion.id,
            deporteId: deporte,
            tipo: ChatTipo.INSTRUCTOR_ORGANIZACION,
          })
        );
      });
      forkJoin(solicitudesChats).subscribe({
        next: (respuestas) => {
          console.log('Todos los chats fueron creados:', respuestas);
        },
        error: (err) => {
          console.error('Error al crear chats:', err);
        }
      });
    });
    this.loadUserChats();
    this.setupWebSocket();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUserChats(): void {
    const id = Number(localStorage.getItem("id"))
    const rol = localStorage.getItem("rol")
    const token = localStorage.getItem("token")
    if(!token || !rol) {
            throw new Error("Not Token Found")
          }
    this.cservice.getChats(token,rol,id).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (chats) => {
        this.chats = chats;
        console.log(chats)
        this.chats.forEach(chat => {
          chat.unread = this.calculateUnreadMessages(chat);
        });
      },
      error: (err) => console.error('Error loading chats:', err)
    });
  }

  selectChat(chat: any): void {
    this.selectedChat = chat;
    this.loadMessages(chat.id);
    this.markMessagesAsRead(chat.id);
  }

  loadMessages(reset: boolean = false): void {
    const token = localStorage.getItem("token")
    if(!token ) {
            throw new Error("Not Token Found")
          }
    if (!this.selectedChat || this.loadingMessages) return;

    if (reset) {
      this.currentPage = 0;
      this.messages = [];
    }

    this.loadingMessages = true;
    
    this.mservice.getMensajesPaginados(
      this.selectedChat.id,
      this.currentPage,
      this.pageSize,
      token
    ).pipe(
      finalize(() => this.loadingMessages = false)
    ).subscribe({
      next: (pagina) => {
        const nuevosMensajes = pagina.content.map(msg => ({
        ...msg,
        sentAt: msg.fechaEnvio,
        content: msg.contenido,
        senderId: msg.remitenteId,
        read: msg.leido
      }));
      
      this.messages = reset ? nuevosMensajes : [...nuevosMensajes, ...this.messages];
        this.totalMessages = pagina.totalElements;
        this.currentPage++;
        this.messages.reverse()
        this.scrollToBottom();
      },
      error: (err) => console.error('Error loading messages:', err)
    });
  }

  onScroll(event: any): void {
    const element = event.target;
    const atTop = element.scrollTop === 0;
    
    if (atTop && this.currentPage * this.pageSize < this.totalMessages) {
      this.loadMessages();
    }
  }

  sendMessage(): void {
    const id = Number(localStorage.getItem("id"))
    const rol = localStorage.getItem("rol")
    console.log(rol)
    if (!rol){
      throw new Error("Not Token Found")
    }
    if (!this.newMessage.trim() || !this.selectedChat) return;
    const message :MensajeDTO = {
      idChat: this.selectedChat.id,
      contenido: this.newMessage,
      remitenteTipo : RemitenteTipo.INSTRUCTOR,
      remitenteId: id,
      fechaEnvio: new Date(),
      leido : false
    };
    console.log(message)
    this.wsservice.sendMessage(message);
    this.messages.push({
      ...message,
      sentAt: new Date().toISOString(),
      read: false
    });
    
    this.newMessage = '';
    this.scrollToBottom();
  }

  private setupWebSocket(): void {
    this.wsservice.connect().subscribe({
    next: (mensaje: MensajeDTO) => {
      if (mensaje.idChat === this.selectedChat?.id) {
        this.messages.push(mensaje);
        this.scrollToBottom();
      }
      this.updateChatList(mensaje);
    },
    error: (err) => console.error('Error en WebSocket:', err)
  });
  }

  private updateChatList(newMessage: any): void {
    const chat = this.chats.find(c => c.id === newMessage.chatId);
    if (chat) {
      chat.lastMessage = newMessage.content;
      chat.lastMessageDate = newMessage.sentAt;
      if (this.selectedChat?.id !== newMessage.chatId) {
        chat.unread += 1;
      }
    }
  }

  private calculateUnreadMessages(chat: any): number {
    return chat.messages?.filter((m: any) => 
      !m.read && m.senderId !== this.currentUser.id
    ).length || 0;
  }

  private markMessagesAsRead(chatId: number): void {
    const token = localStorage.getItem("token");
  if (!token) return;

  this.cservice.markAsRead(token, chatId)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: () => {
        this.chats = this.chats.map(chat => {
          if (chat.id === chatId) {
            chat.unread = 0;
          }
          return chat;
        });
      },
      error: (err) => console.error('Error marcando como leído:', err)
    });
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const container = document.querySelector('.message-container');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 100);
  }

  getChatName(chat: Chat): string {
    switch(chat.tipo) {
      case 'INSTRUCTOR_DEPORTISTA':
        return chat.deportista?.nombre + ' ' + chat.deportista?.apellido;
      case 'EQUIPO':
        return chat.equipo?.nombre;
      case 'INSTRUCTOR_ORGANIZACION':
        return chat.organizacion?.nombre;
      default:
        return 'Chat';
    }
  }

isCurrentUser(mensaje: Mensaje): boolean {
  const currentUserId = Number(localStorage.getItem("id"));
  return mensaje.remitenteId === currentUserId && mensaje.remitenteTipo=="INSTRUCTOR";
}

  formatDate(dateString: string | Date | undefined | null): string {
  if (!dateString) return ''; // Devuelve vacío si es null o undefined

  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;

  if (isNaN(date.getTime())) return ''; // Fecha inválida (como new Date(''))

  return date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit'
  });
}
}
