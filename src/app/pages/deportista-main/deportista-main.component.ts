import { Component, OnInit , inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Evento } from '../../models/evento.model';
import { EventoService } from '../../services/evento.service';
import { RouterModule } from '@angular/router'; 
import { RutinaService } from '../../services/rutina.service';
import { RutinaDTOR } from '../../models/rutinaDTOr.model';
import { FormsModule } from '@angular/forms';
import { CheckInRutinaService } from '../../services/checkinrutina.service';
import { CheckInRutina } from '../../models/checkinRutina.model';
import { EquipoService } from '../../services/equipo.service';
import { Equipo } from '../../models/equipo.model';
@Component({
    selector: 'app-deportista-main',
    imports: [CommonModule, RouterModule,FormsModule],
    standalone:true,
    templateUrl: './deportista-main.component.html',
    styleUrl: './deportista-main.component.css'
})
export class DeportistaMainComponent implements OnInit{
  private chservice = inject(CheckInRutinaService)
  private rservice = inject(RutinaService)
  private eservice = inject(EventoService)
  private eqservice = inject(EquipoService)
  nombre: string | null = '';
  apellido: string | null = '';
  deporte: string = '';
  posicion: string | null = ''
  fotoPerfil: string = "http://localhost:8080/";
  rutinasCompletadasArray: CheckInRutina[]= [];
  rutinasCompletadas :number = 0
  rutinasPendientesArray: RutinaDTOR[]= []
  rutinasPendientes: number = 0;
  eventosInscritos: number = 0;
  eventosInscritosArray: Evento[]=[]
  equiposActivosArray:Equipo[]=[]
  equiposActivos: number = 0;
  proximosEventos: any[] = [];
  misEquipos: any[] = [];
  rutinasPendientesHoy: any[] = [];
  medicionesRecientes: any[] = [];
  
  // Filtros
  notificationMessage: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 10;
  eventFilter: string = 'all';
  eventSearch: string = '';
  filteredEvents: any[] = [];
  pages:any[]=[]
  
  // UI
  showUserDropdown: boolean = false;
  showNotification: boolean = false;

  constructor(
  ) { }

  ngOnInit(): void {
    this.cargarDatosDeportista();
  }

  cargarDatosDeportista(): void {
    const fotoPerfil = localStorage.getItem("fotoPerfil")
    this.cargarRutinasCompletadas ()
    this.cargarRutinasPendientes()
    this.cargarProximosEventos();
    this.cargarMisEquipos()
    this.nombre=localStorage.getItem("nombre") 
    this.apellido = localStorage.getItem("apellido")
    this.fotoPerfil = this.fotoPerfil+ fotoPerfil
    this.posicion = localStorage.getItem("posicion")   
  }

  cargarRutinasCompletadas(){
    console.log("hola")
    const id =Number(localStorage.getItem("id"))
    const token = localStorage.getItem("token")
    if(!token){
      throw new Error("Not Token Found")
    }
    this.chservice.list(id,token).subscribe({
      next:(data)=>{
        this.rutinasCompletadasArray= data
        this.rutinasCompletadas = data.length
      },
      error:(err)=>{
        console.error(err)
      }
    })
  }

  cargarEstadisticas(): void {
    
  }

  cargarProximosEventos(): void {
    console.log("hola")
    const id =Number(localStorage.getItem("id"))
    const token = localStorage.getItem("token")
    if(!token){
      throw new Error("Not Token Found")
    }
    this.eservice.listEventosByDeportista(id,token).subscribe({
      next:(data)=>{
        console.log(data)
        this.eventosInscritosArray = data
        this.eventosInscritos = data.length
        this.filterEvents()
      },
      error:(err)=>{

      }
    })
  }

  cargarMisEquipos(): void {
    const id =Number(localStorage.getItem("id"))
    const token = localStorage.getItem("token")
    if(!token){
      throw new Error("Not Token Found")
    }
    this.eqservice.listByIdDeportista(id,token).subscribe({
      next:(data)=>{
        this.equiposActivosArray=data
        this.equiposActivos=data.length
      },
      error:(err)=>{
        console.error(err)
      }
    })
  }

  cargarRutinasPendientes(): void {
    const id =Number(localStorage.getItem("id"))
    const token = localStorage.getItem("token")
    if(!token){
      throw new Error("Not Token Found")
    }
    this.rservice.getRutinasByEjerciciosAndDia(id,token).subscribe({
      next:(data)=>{
        this.rutinasPendientesArray=data
        this.rutinasPendientes=data.length
      }, 
      error:(err)=>{
        console.error(err)
      }
    })
  }

  cargarMedicionesRecientes(): void {
    
  }

  filterEvents(): void {
    if (!this.eventosInscritosArray?.length) {
      this.filteredEvents = [];
      return;
    }
    let eventosFiltrados = this.eventosInscritosArray.filter(evento => {
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
  calculatePages(): void {
    const totalPages = Math.ceil(this.filteredEvents.length / this.itemsPerPage);
  this.pages = Array.from({length: totalPages}, (_, i) => i + 1);
  if (this.currentPage > totalPages && totalPages > 0) {
    this.currentPage = totalPages;
  }
  }

  marcarRutinaCompletada(rutinaId: number|undefined): void {
    
  }

  mostrarNotificacion(mensaje: string): void {
  }

  logout(): void {
  }

  toggleUserDropdown(): void {
    this.showUserDropdown = !this.showUserDropdown;
  }

}

