import { Component , inject, OnInit} from '@angular/core';
import { EventoService } from '../../../services/evento.service';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EventoConEquipos } from '../../../models/eventoconEquipos.model';
import { Evento } from '../../../models/evento.model';
import { Equipo } from '../../../models/equipo.model';
import { Deportista } from '../../../models/deportista.model';
import { EquipoService } from '../../../services/equipo.service';
import { DeportistaService } from '../../../services/deportista.service';
import { JugadorEquipoService } from '../../../services/jugadorequipo.service';
import { JugadorEquipo } from '../../../models/jugadorEquipo.model';

@Component({
    selector: 'app-equipo-org',
    imports: [FormsModule, CommonModule],
    templateUrl: './equipo-org.component.html',
    styleUrl: './equipo-org.component.css',
    standalone : true
})
export class EquipoOrgComponent implements OnInit {
  private eeservice= inject(EventoService)
  private deservice = inject(JugadorEquipoService)
  eventosEquipos: EventoConEquipos[] = [];
  filteredEventos: EventoConEquipos[] = [];
  showPlayers: JugadorEquipo[] = [];
  isLoading = true;
  errorMessage = '';
  equipos:Equipo[]=[]
  searchText = '';
  eventFilter = 'all';
  sportFilter = '';
  currentPage = 1;
  itemsPerPage = 5;
  pages: number[] = [];
  selectedEvent: any = null;

  ngOnInit(): void {
    this.loadEventosEquipos();
  }
  openTeamsModal(evento: EventoConEquipos): void {
    this.selectedEvent = evento;
    this.equipos = evento.equipos
  }

  loadEventosEquipos(): void {
    const id = Number(localStorage.getItem("id"))
    const token = localStorage.getItem("token")
    if(!token) {
      throw new Error("Not Token Found")
    }
    this.isLoading = true;
    this.eeservice.getProximosEventosConEquipos(id,token).subscribe({
      next: (data) => {
        this.eventosEquipos = data;
        this.filteredEventos = [...data];
        this.calculatePages();
        this.isLoading = false;
        console.log(data)
      },
      error: (err) => {
        this.errorMessage = 'Error al cargar los eventos. Por favor, intente nuevamente.';
        this.isLoading = false;
        console.error('Error loading eventos:', err);
      }
    });
  }

  toggleTeamPlayers(teamId: number): void {
    const id = Number(localStorage.getItem("id"))
    const token = localStorage.getItem("token")
    if(!token) {
      throw new Error("Not Token Found")
    }
    this.deservice.list(teamId,token).subscribe({
      next:(data)=>{
       this.showPlayers = data
      },
      error:(err)=>{
        console.error(err)
      }
    })
  }

  filterEvents(): void {
    this.filteredEventos = this.eventosEquipos.filter(eventoEquipo => {
      const matchesSearch = eventoEquipo.evento.nombre.toLowerCase().includes(this.searchText.toLowerCase()) || 
                          eventoEquipo.evento.descripcion?.toLowerCase().includes(this.searchText.toLowerCase());
      const currentDate = new Date();
      const eventDate = new Date(eventoEquipo.evento.fecha);
      let matchesTimeFilter = true;
      
      if (this.eventFilter === 'future') {
        matchesTimeFilter = eventoEquipo.evento.estado == "PLANIFICADO";
      } else if (this.eventFilter === 'past') {
        matchesTimeFilter = eventoEquipo.evento.estado == "PASADO";
      }else if(this.eventFilter === "active"){
        matchesTimeFilter = eventoEquipo.evento.estado == "ACTIVO"
      }
      
      return matchesSearch && matchesTimeFilter;
    });
    
    this.currentPage = 1;
    this.calculatePages();
  }

  calculatePages(): void {
    const pageCount = Math.ceil(this.filteredEventos.length / this.itemsPerPage);
    this.pages = Array.from({ length: pageCount }, (_, i) => i + 1);
  }

  goToPage(page: number): void {
    this.currentPage = page;
  }

  get paginatedEvents(): any[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredEventos.slice(startIndex, startIndex + this.itemsPerPage);
  }


  getUniqueSports(): any[] {
    const sportsMap = new Map();
    this.eventosEquipos.forEach(eventoEquipo => {
      const sport = eventoEquipo.evento.deporte;
      if (!sportsMap.has(sport.id)) {
        sportsMap.set(sport.id, sport);
      }
    });
    return Array.from(sportsMap.values());
  }
  
  getStatusClass(status: string): any {
    return {
      'bg-green-900/50 text-green-400': status === 'ACTIVO',
      'bg-yellow-900/50 text-yellow-400': status === 'PLANIFICADO',
      'bg-red-900/50 text-red-400': status === 'CANCELADO',
      'bg-gray-700 text-gray-300': status === 'PASADO'
    };
  }
  
  getTeamStatusClass(status: string): any {
    return {
      'bg-green-900/50 text-green-400': status === 'ACTIVO',
      'bg-red-900/50 text-red-400': status === 'INACTIVO'
    };
  }
  
  getParticipationPercentage(evento: Evento): number {
    if (!evento.numMaxEquipos || evento.numMaxEquipos === 0) return 0;
    return (evento.equiposInscritos / evento.numMaxEquipos) * 100;
  }
}
