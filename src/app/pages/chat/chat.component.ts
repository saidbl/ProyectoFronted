import { Component, inject, ChangeDetectionStrategy, ChangeDetectorRef, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { delay, filter, finalize, forkJoin, Subject, Subscription, switchMap, take, takeUntil } from 'rxjs';
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
import { Deportista } from '../../models/deportista.model';
import { JugadorEquipoService } from '../../services/jugadorequipo.service';
import { JugadorEquipo } from '../../models/jugadorEquipo.model';
import { RouterModule } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [FormsModule, CommonModule,RouterModule,MatIcon],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatComponent implements OnInit, OnDestroy {
  @ViewChild('chatContainer') chatContainer!: ElementRef;
  private cservice = inject(ChatService);
  private wsservice = inject(WsService);
  private eservice = inject(EquipoService);
  private dservice = inject(DeportistaService);
  private mservice = inject(MensajeService);
  private oservice = inject(OrganizacionService);
  private cdRef = inject(ChangeDetectorRef);
  private jeservice = inject(JugadorEquipoService)
  notificacionesPorChat: Map<number, MensajeDTO[]> = new Map();

  chats: Chat[] = [];
  selectedChat: Chat | null = null;
  messages: MensajeDTO[] = [];
  newMessage = '';
  private destroy$ = new Subject<void>();
  private wsSubscription!: Subscription;
  
  currentPage = 0;
  pageSize = 20;
  totalMessages = 0;
  loadingMessages = false;
  totalNotificaciones = 0;
  esChatEquipo = false;
  nombresDeportistas: Map<number, string> = new Map<number, string>();
  fotosDeportistas: Map<number, string> = new Map<number, string>();
  constructor(private wsService: WsService){}
  ngOnInit(): void {
     this.wsService.connect();
      this.wsService.connectionEstablished.pipe(
        filter(connected => connected),
        take(1),
        delay(150), 
        switchMap(() => this.wsService.getNotificacionesPorChat()),
        takeUntil(this.destroy$)
      ).subscribe(map => {
        this.notificacionesPorChat = new Map();
      map.forEach((mensajes, chatId) => {
        this.notificacionesPorChat.set(chatId, mensajes);
      });
      console.log(this.notificacionesPorChat)
      this.cdRef.markForCheck();
      });
    this.initializeChats();
    this.setupWebSocket();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
    }
  }

  private getToken(): string {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Token no encontrado");
    }
    return token;
  }

  private initializeChats(): void {
    const idInstructor = Number(localStorage.getItem("id"));
    const token = this.getToken();
    const deporte = Number(localStorage.getItem("idDeporte"));

    forkJoin({
      deportistas: this.dservice.list(idInstructor, token),
      equipos: this.eservice.list(idInstructor, token),
      organizaciones: this.oservice.getbyDeporte(deporte, token),
    }).subscribe({
      next: ({ deportistas, equipos, organizaciones }) => {
        const solicitudesChats = [];
        
        // Crear chats para deportistas
        for (const deportista of deportistas) {
          solicitudesChats.push(this.cservice.createChat(token, {
            instructorId: idInstructor,
            deportistaId: deportista.id,
            equipoId: 0,
            organizacionId: 0,
            deporteId: deporte,
            tipo: ChatTipo.INSTRUCTOR_DEPORTISTA,
          }));
        }
        for (const equipo of equipos) {
          solicitudesChats.push(this.cservice.createChat(token, {
            instructorId: idInstructor,
            deportistaId: 0,
            equipoId: equipo.id,
            tipo: ChatTipo.EQUIPO,
            organizacionId: 0,
            deporteId: deporte,
          }));
        }
        for (const organizacion of organizaciones) {
          solicitudesChats.push(this.cservice.createChat(token, {
            instructorId: idInstructor,
            deportistaId: 0,
            equipoId: 0,
            organizacionId: organizacion.id,
            deporteId: deporte,
            tipo: ChatTipo.INSTRUCTOR_ORGANIZACION,
          }));
        }

        forkJoin(solicitudesChats).subscribe({
          next: () => this.loadUserChats(),
          error: (err) => console.error('Error al crear chats:', err)
        });
      },
      error: (err) => console.error('Error cargando datos iniciales:', err)
    });
  }

  loadUserChats(): void {
    const id = Number(localStorage.getItem("id"));
    const rol = localStorage.getItem("rol") || '';
    const token = this.getToken();

    this.cservice.getChats(token, rol, id).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (chats) => {
        this.chats = chats;
        this.cdRef.markForCheck();
      },
      error: (err) => console.error('Error cargando chats:', err)
    });
  }

  selectChat(chat: Chat): void {
     this.wsService.limpiarNotificacionesDeChat(chat.id);
    this.nombresDeportistas.clear();
    this.fotosDeportistas.clear();

    if (chat.tipo === ChatTipo.EQUIPO) {
      this.loadEquipoMembers(chat);
    } else {
      this.esChatEquipo = false;
      this.finalizeChatSelection(chat);
    }
  }
  getNotificationCount(chatId: number): number {
  return this.notificacionesPorChat.get(chatId)?.length || 0;
}

  private loadEquipoMembers(chat: Chat): void {
    const token = this.getToken();
    const equipoId = chat.equipo?.id;
    
    if (!equipoId) {
      this.finalizeChatSelection(chat);
      return;
    }

    this.jeservice.list(equipoId, token).subscribe({
      next: (deportistas: JugadorEquipo[]) => {
        deportistas.forEach(d => {
          this.nombresDeportistas.set(d.deportista.id, `${d.deportista.nombre} ${d.deportista.apellido}`);
          this.fotosDeportistas.set(d.deportista.id, d.deportista.fotoPerfil);
        });
        this.esChatEquipo = true;
        this.finalizeChatSelection(chat);
      },
      error: (err) => {
        console.error('Error cargando miembros del equipo:', err);
        this.finalizeChatSelection(chat);
      }
    });
  }

  private finalizeChatSelection(chat: Chat): void {
    this.selectedChat = chat;
    this.loadMessages(true);
    this.cdRef.markForCheck();
  }

  getNombreRemitente(mensaje: MensajeDTO): string {
    console.log(this.selectedChat?.tipo)
    switch (mensaje.remitenteTipo) {
      case RemitenteTipo.INSTRUCTOR:
        return `${localStorage.getItem("nombre")} ${localStorage.getItem("apellido")}`;
      
      case RemitenteTipo.DEPORTISTA:
        if (this.selectedChat?.tipo === ChatTipo.EQUIPO) {
          console.log(this.nombresDeportistas)
          console.log(mensaje.remitenteId)
          console.log(this.nombresDeportistas.get(mensaje.remitenteId))
          return this.nombresDeportistas.get(mensaje.remitenteId) || 'Deportista';
        }
        return this.selectedChat?.deportista?.nombre 
          ? `${this.selectedChat.deportista.nombre} ${this.selectedChat.deportista.apellido}`
          : 'Deportista';
      
      case RemitenteTipo.ORGANIZACION:
        return this.selectedChat?.organizacion?.nombre || 'Organización';
      
      default:
        return 'Remitente';
    }
  }

  getImagenMensaje(mensaje: MensajeDTO): string {
    if (!mensaje.remitenteTipo) return 'assets/default.png';

    switch (mensaje.remitenteTipo) {
      case RemitenteTipo.INSTRUCTOR:
        return localStorage.getItem("fotoPerfil") || 'assets/default.png';
      
      case RemitenteTipo.DEPORTISTA:
        if (this.selectedChat?.tipo === ChatTipo.EQUIPO) {
          return this.fotosDeportistas.get(mensaje.remitenteId) || 'assets/default.png';
        }
        return this.selectedChat?.deportista?.fotoPerfil || 'assets/default.png';
      
      case RemitenteTipo.ORGANIZACION:
        return this.selectedChat?.organizacion?.imagen || 'assets/default.png';
      
      default:
        return 'assets/default.png';
    }
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.selectedChat) return;
     const now = new Date();

  const offset = 6; 
  const fechaEnvioCDMX = new Date(now.getTime() - offset * 60 * 60 * 1000);

    const message: MensajeDTO = {
      idChat: this.selectedChat.id,
      contenido: this.newMessage,
      remitenteTipo: RemitenteTipo.INSTRUCTOR,
      remitenteId: Number(localStorage.getItem("id")),
      fechaEnvio: fechaEnvioCDMX,
      leido: false
    };

    this.wsservice.sendMessage(message);
    this.messages = [message,...this.messages];
    this.newMessage = '';
    this.scrollToBottom();
    this.cdRef.markForCheck();
  }

  private setupWebSocket(): void {
    this.wsSubscription = this.wsservice.connect().subscribe({
      next: (mensaje: MensajeDTO) => {
        if (mensaje.idChat === this.selectedChat?.id) {
          this.messages = [...this.messages, mensaje];
          this.scrollToBottom();
        }
        this.updateChatList(mensaje);
        this.cdRef.markForCheck();
      },
      error: (err) => console.error('Error en WebSocket:', err)
    });
  }

  private updateChatList(newMessage: MensajeDTO): void {
    const chatIndex = this.chats.findIndex(c => c.id === newMessage.idChat);
    if (chatIndex === -1) return;

    const chat = this.chats[chatIndex];
    
    if (this.selectedChat?.id !== newMessage.idChat) {
    }
    this.chats.splice(chatIndex, 1);
    this.chats.unshift(chat);
  }

  loadMessages(reset: boolean = false): void {
    if (!this.selectedChat || this.loadingMessages) return;
    
    const token = this.getToken();

    if (reset) {
      this.currentPage = 0;
      this.messages = [];
      this.totalMessages = 0;
    }

    if (this.totalMessages > 0 && this.messages.length >= this.totalMessages) {
      return;
    }

    this.loadingMessages = true;

    this.mservice.getMensajesPaginados(
      this.selectedChat.id,
      this.currentPage,
      this.pageSize,
      token
    ).pipe(
      finalize(() => {
        this.loadingMessages = false;
        this.cdRef.markForCheck();
      })
    ).subscribe({
      next: (pagina) => {
        const nuevosMensajes = pagina.content;
        const chatContainer = this.chatContainer?.nativeElement;
      const previousHeight = chatContainer?.scrollHeight;
        this.messages = reset 
          ? nuevosMensajes 
          : [...nuevosMensajes, ...this.messages];
        
        this.totalMessages = pagina.totalElements;
        this.currentPage++;
        
        setTimeout(() => {
        if (reset) {
          this.scrollToBottom(); 
        } else if (chatContainer) {
          const newHeight = chatContainer.scrollHeight;
          chatContainer.scrollTop = newHeight - previousHeight;
        }
      }, 100); 
    },
      error: (err) => console.error('Error cargando mensajes:', err)
    });
  }

  onScroll(event: Event): void {
    const element = event.target as HTMLElement;
    if (element.scrollTop === 0 && !this.loadingMessages) {
      this.loadMessages();
    }
  }


  private scrollToBottom(): void {
    setTimeout(() => {
    const container = this.chatContainer?.nativeElement;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, 100);
  }

  getChatName(chat: Chat | null): string {
    if (!chat) return 'Chat';
    
    switch (chat.tipo) {
      case ChatTipo.INSTRUCTOR_DEPORTISTA:
        return `${chat.deportista?.nombre} ${chat.deportista?.apellido}`;
      case ChatTipo.EQUIPO:
        return chat.equipo?.nombre || 'Equipo';
      case ChatTipo.INSTRUCTOR_ORGANIZACION:
        return chat.organizacion?.nombre || 'Organización';
      default:
        return 'Chat';
    }
  }

  getImagenUrl(chat: Chat | null): string {
    if (!chat) return 'assets/default.png';
    
    switch (chat.tipo) {
      case ChatTipo.INSTRUCTOR_DEPORTISTA:
        return chat.deportista?.fotoPerfil || 'assets/default.png';
      case ChatTipo.EQUIPO:
        return chat.equipo?.img || 'assets/default.png';
      case ChatTipo.INSTRUCTOR_ORGANIZACION:
        return chat.organizacion?.imagen || 'assets/default.png';
      default:
        return 'assets/default.png';
    }
  }

  isCurrentUser(mensaje: MensajeDTO): boolean {
    const currentUserId = Number(localStorage.getItem("id"));
    return mensaje.remitenteId === currentUserId && 
           mensaje.remitenteTipo === RemitenteTipo.INSTRUCTOR;
  }

  formatDate(fecha: string | Date): string {
  const date = new Date(fecha);
  return date.toLocaleString('es-MX', {
    timeZone: 'America/Mexico_City',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}


}