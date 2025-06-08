import { Component, OnInit , inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Evento } from '../../models/evento.model';
import { EventoService } from '../../services/evento.service';
import { Router, RouterModule } from '@angular/router'; 
import { RutinaService } from '../../services/rutina.service';
import { RutinaDTOR } from '../../models/rutinaDTOr.model';
import { FormsModule } from '@angular/forms';
import { CheckInRutinaService } from '../../services/checkinrutina.service';
import { CheckInRutina } from '../../models/checkinRutina.model';
import { EquipoService } from '../../services/equipo.service';
import { Equipo } from '../../models/equipo.model';
import { MatIcon } from '@angular/material/icon';
import { MatIconModule } from '@angular/material/icon';
import Swal from 'sweetalert2';
import { DeportistaService } from '../../services/deportista.service';
import { Subscription, forkJoin } from 'rxjs';
@Component({
    selector: 'app-deportista-main',
    imports: [CommonModule, RouterModule,FormsModule,MatIcon,MatIconModule],
    standalone:true,
    templateUrl: './deportista-main.component.html',
    styleUrl: './deportista-main.component.css'
})
export class DeportistaMainComponent implements OnInit{
  private chservice = inject(CheckInRutinaService)
  private rservice = inject(RutinaService)
  private eservice = inject(EventoService)
  private eqservice = inject(EquipoService)
  private dservice = inject(DeportistaService)
  private subscriptions: Subscription = new Subscription();
   hasError: boolean = false;
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
   isLoading: boolean = true;
  navigation = [
  { name: 'CheckIn de Hoy', route: 'check', icon: 'event' },
  { name: 'Eventos', route: 'proximoseventos', icon: 'event' },
  { name: 'Equipos', route: 'equipos', icon: 'groups' },
  { name: 'Rutinas', route: 'rutinas', icon: 'fitness_center' },
  { name: 'Rendimiento', route: 'rendimiento', icon: 'analytics' }
];
constructor(public router: Router) {}
  notificationMessage: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 10;
  eventFilter: string = 'all';
  eventSearch: string = '';
  filteredEvents: any[] = [];
  pages:any[]=[]
  showUserDropdown: boolean = false;
  showNotification: boolean = false;

  ngOnInit(): void {
    this.validateSession();
    this.cargarDatosDeportista();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  validateSession(): void {
    const token = localStorage.getItem('token');
    const id = localStorage.getItem('id');
    
    if (!token || !id) {
      Swal.fire({
        icon: 'warning',
        title: 'Sesión expirada',
        text: 'Por favor inicie sesión nuevamente',
      }).then(() => {
        this.router.navigate(['/login']);
      });
    }
  }

  cargarDatosDeportista(): void {
    this.isLoading = true;
    this.hasError = false;
    const id = Number(localStorage.getItem('id'));
    const token = localStorage.getItem('token');
    if (!token || !id) {
      this.handleError('Credenciales inválidas');
      return;
    }
    const loadData$ = forkJoin({
      rutinasCompletadas: this.chservice.list(id, token),
      rutinasPendientes: this.rservice.getRutinasByEjerciciosAndDia(id, token),
      eventos: this.eservice.listEventosByDeportista(id, token),
      equipos: this.eqservice.listByIdDeportista(id, token),
    });

    const dataSubscription = loadData$.subscribe({
      next: ({ 
        rutinasCompletadas, 
        rutinasPendientes, 
        eventos, 
        equipos,
      }) => {
        this.nombre = localStorage.getItem('nombre') || '';
        this.apellido = localStorage.getItem('apellido') || '';
        this.posicion = localStorage.getItem('posicion') || '';
        const foto = localStorage.getItem('fotoPerfil');
        this.fotoPerfil = foto ? `http://localhost:8080/${foto}` : this.fotoPerfil;
        this.rutinasCompletadasArray = rutinasCompletadas;
        this.rutinasCompletadas = rutinasCompletadas.length;
        this.rutinasPendientesArray = rutinasPendientes;
        this.rutinasPendientes = rutinasPendientes.length;
        this.eventosInscritosArray = eventos;
        this.eventosInscritos = eventos.length;
        this.equiposActivosArray = equipos;
        this.equiposActivos = equipos.length;
        this.filterEvents();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading data:', err);
        this.handleError('Error al cargar datos. Intente recargar la página');
        this.isLoading = false;
      }
    });

    this.subscriptions.add(dataSubscription);
  }

  handleError(message: string): void {
    this.hasError = true;
    this.notificationMessage = message;
    this.showNotification = true;
    
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: message,
      timer: 3000,
      showConfirmButton: false
    });
    
    setTimeout(() => this.showNotification = false, 5000);
  }

  cargarProximosEventos(): void {
    const id = Number(localStorage.getItem('id'));
    const token = localStorage.getItem('token');
    
    if (!token || !id) {
      this.handleError('No se pudo cargar eventos');
      return;
    }

    const eventSub = this.eservice.listEventosByDeportista(id, token).subscribe({
      next: (data) => {
        this.eventosInscritosArray = data;
        this.eventosInscritos = data.length;
        this.filterEvents();
      },
      error: (err) => this.handleError('Error al cargar eventos')
    });
    
    this.subscriptions.add(eventSub);
  }

  filterEvents(): void {
    if (!this.eventosInscritosArray?.length) {
      this.filteredEvents = [];
      this.pages = [];
      return;
    }
    
    let eventosFiltrados = [...this.eventosInscritosArray];
    
    // Filtro por estado
    if (this.eventFilter !== 'all') {
      eventosFiltrados = eventosFiltrados.filter(evento => 
        evento.estado === this.eventFilter.toUpperCase()
      );
    }
    
    // Filtro de búsqueda
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
    this.pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    
    if (this.currentPage > totalPages && totalPages > 0) {
      this.currentPage = totalPages;
    }
  }

  changePage(page: number): void {
    this.currentPage = page;
  }

  get paginatedEvents(): Evento[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredEvents.slice(startIndex, startIndex + this.itemsPerPage);
  }

  toggleUserDropdown(): void {
    this.showUserDropdown = !this.showUserDropdown;
  }

  cerrarSesion(): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Quieres cerrar sesión?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.dservice.logOut();
        this.router.navigate(['/login']);
        Swal.fire('Sesión cerrada', '', 'success');
      }
    });
  }
  handleDataChange(): void {
    Swal.fire({
      title: 'Datos actualizados',
      text: 'La información se ha actualizado correctamente',
      icon: 'success',
      timer: 2000,
      showConfirmButton: false
    });
    this.cargarDatosDeportista();

}
}
