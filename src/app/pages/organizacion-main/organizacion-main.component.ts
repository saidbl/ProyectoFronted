import { Component, OnInit ,inject} from '@angular/core';
import { RouterModule } from '@angular/router'; 
import { CommonModule } from '@angular/common';
import { Deporte } from '../../models/deporte.model';
import { FormsModule } from '@angular/forms';
import { Evento } from '../../models/evento.model';
import { EventoService } from '../../services/evento.service';
import { EventoConEquipos } from '../../models/eventoconEquipos.model';
import { Equipo } from '../../models/equipo.model';
@Component({
  selector: 'app-organizacion-main',
  standalone: true,
  imports: [RouterModule,CommonModule ,FormsModule ],
  templateUrl: './organizacion-main.component.html',
  styleUrl: './organizacion-main.component.css'
})
export class OrganizacionMainComponent implements OnInit {
  private eservice = inject(EventoService)
  nombre_organizacion:string= ""
  proximoEvento:any 
  totalEventos:number =0
  eventosActivos : number = 0
  totalEquipos:number =0
  eventosRecientes:any
  organizacionId: number =0;
  eventosPlanificados: number = 0;
  equiposActivos: number = 0;
  proximosEventos: Evento[] = [];
  ultimosEquipos: Equipo[] = [];
  eventosconEquipos : EventoConEquipos[]=[]
  allEvents: Evento[] = [];
  filteredEvents: any[] = [];
  sports: Deporte[] = [];
  eventFilter: string = 'all';
  eventSearch: string = '';
  selectedSport: string = 'all';
  pages:any[]=[]
  showUserDropdown: boolean = false;
  showNotification: boolean = false;
  notificationMessage: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 10;
  ngOnInit(): void {
    const token = localStorage.getItem("token")
      const id = Number(localStorage.getItem("id"))
      if(!token) {
        throw new Error("Not Token Found")
      }
    this.loadInitialData(token,id)
  }



  private loadInitialData(token:string, id : number): void {
    this.loadAllEvents(token,id);
  }


  private loadAllEvents(token: string, id:number): void {
    this.eservice.listEventosByOrganizacion(id,token).subscribe({
      next:(data)=>{
        this.allEvents=data
        this.totalEventos= data.length
        this.eventosActivos= this.geteventosActivos(data)
        this.proximoEvento= this.getProximoEvento(data)
        this.eventosPlanificados=this.geteventosPendientes(data)
        this.proximosEventos = this.getProximosEventos(data) 
        this.equiposActivos = this.getTotalEquiposActivos(data)
        this.totalEquipos = this.getTotalEquipos(data)
        console.log(data)
        this.filterEvents()
      },
      error:(err)=>{
        console.error(err)
      }
    })
    this.eservice.getProximosEventosConEquipos(id,token).subscribe({
      next:(data)=>{
        this.eventosconEquipos=data
        this.ultimosEquipos = data.flatMap(objeto => objeto.equipos);
        console.log(data)
      },
      error:(err)=>{
        console.log(err)
      }
    })
  }
  
  private getTotalEquipos(data: Evento[]):number{
    let suma=0;
    data.forEach(ev=>{
      suma+=ev.equiposInscritos
      console.log(suma)
      console.log(ev.equiposInscritos)
    })
    return suma
  }
  private getTotalEquiposActivos(data: Evento[]): number{
    const ahora = new Date();
    let suma=0;
    let eventos = data.filter(e => new Date(e.fecha) >= ahora)
    console.log(ahora)
    console.log(eventos)
    eventos.forEach(ev=>{
      suma+=ev.equiposInscritos
      console.log(suma)
      console.log(ev.equiposInscritos)
    })
    return suma
  }

  private geteventosActivos(data: Evento []): number{
    if (!data?.length) return 0;
    return data.filter(e => e.estado == "ACTIVO").length
  }
  private geteventosPendientes(data: Evento []): number{
    if (!data?.length) return 0;
    return data.filter(e => e.estado == "PLANIFICADO").length
  }

  private getProximoEvento(eventos: Evento[]): Evento | null {
    if (!eventos?.length) return null;
  const ahora = new Date();
  const eventosActivos = eventos.filter(e => 
    e.estado === 'ACTIVO' && new Date(e.fecha) >= ahora
  );
  if (eventosActivos.length > 0) {
    return eventosActivos.sort((a, b) => 
      new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
    )[0];
  }
  const eventosPlanificados = eventos.filter(e => 
    e.estado === 'PLANIFICADO' && new Date(e.fecha) >= ahora
  );
  if (eventosPlanificados.length > 0) {
    return eventosPlanificados.sort((a, b) => 
      new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
    )[0];
  }
  return eventos.sort((a, b) => 
    new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
  )[0];
  }
  private getProximosEventos(eventos: Evento[]): Evento[] {
    if (!eventos?.length) return [];
  const ahora = new Date();
  const eventosFuturos = eventos.filter(e => 
    (e.estado === 'ACTIVO' || e.estado === 'PLANIFICADO') && 
    new Date(e.fecha) >= ahora
  ).sort((a, b) => 
    new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
  );
  if (eventosFuturos.length < 3) {
    const eventosPasados = eventos.filter(e => 
      new Date(e.fecha) < ahora
    ).sort((a, b) => 
      new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    );
    return [...eventosFuturos, ...eventosPasados].slice(0, 3);
  }
  
  return eventosFuturos.slice(0, 3);
  }
  filterEvents(): void {
  if (!this.allEvents?.length) {
    this.filteredEvents = [];
    return;
  }
  let eventosFiltrados = this.allEvents.filter(evento => {
    const fechaEvento = new Date(evento.fecha);
    const ahora = new Date();
    let estadoActual = '';
    if (evento.estado === 'CANCELADO') {
      estadoActual = 'cancelado';
    } else if (evento.estado == 'PASADO') {
      estadoActual = 'PASADO';
    } else if (evento.estado === 'ACTIVO') {
      estadoActual = 'ACTIVO';
    } else {
      estadoActual = 'PLANIFICADO';
    }
    switch (this.eventFilter) {
      case 'active':
        return estadoActual === 'ACTIVO';
      case 'planned':
        return estadoActual === 'PLANIFICADO';
      case 'past':
        return estadoActual === 'PASADO';
      default: 
        return true;
    }
  });
  if (this.eventSearch) {
    const searchText = this.eventSearch.toLowerCase();
    eventosFiltrados = eventosFiltrados.filter(evento => 
      evento.nombre.toLowerCase().includes(searchText) ||
      (evento.descripcion && evento.descripcion.toLowerCase().includes(searchText)) ||
      (evento.ubicacion && evento.ubicacion.toLowerCase().includes(searchText))
    );
  }
  this.filteredEvents = eventosFiltrados;
  this.calculatePages();
  }

  updateParticipationChart(): void {
    // Implementar actualización de gráfico según deporte seleccionado
  }

  // Métodos de paginación
  goToPage(page: number): void {
    // Implementar cambio de página
  }

  calculatePages(): void {
    const totalPages = Math.ceil(this.filteredEvents.length / this.itemsPerPage);
  this.pages = Array.from({length: totalPages}, (_, i) => i + 1);
  if (this.currentPage > totalPages && totalPages > 0) {
    this.currentPage = totalPages;
  }
  }

  // Métodos de UI
  toggleUserDropdown(): void {
    // Implementar toggle del dropdown de usuario
  }

  showNotificationMessage(message: string, duration: number = 3000): void {
    // Implementar notificación temporal
  }

  // Métodos de acciones
  deleteEvent(eventId: number): void {
    // Implementar eliminación de evento con confirmación
  }

  logout(): void {
    // Implementar cierre de sesión
  }

  // Métodos auxiliares
  private initCharts(): void {
    // Implementar inicialización de gráficos
  }

  private processEventData(events: Evento[]): Evento[] {
    // Implementar procesamiento adicional de datos de eventos si es necesario
    return events;
  }

  // Métodos para el template (getters)
  get userInitials(): string {
    // Implementar generación de iniciales para avatar
    return '';
  }

  get displayedEvents(): Evento[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
  const endIndex = startIndex + this.itemsPerPage;
  return this.filteredEvents.slice(startIndex, endIndex);
  }
}
