import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventoFecha } from '../../../models/eventoFecha.model';
import { EventoService } from '../../../services/evento.service';
import { Evento } from '../../../models/evento.model';
import { EventoFechaService } from '../../../services/eventoFecha.service';
import { FormsModule } from '@angular/forms';
import { Equipo } from '../../../models/equipo.model';
import { MatIcon } from '@angular/material/icon';
import { EventoEquipoService } from '../../../services/eventoEquipo.service';
import { Router, RouterModule } from '@angular/router'; 
import Swal from 'sweetalert2';
import { DeportistaService } from '../../../services/deportista.service';
@Component({
    selector: 'app-eventos-deportista',
    standalone:true,
    imports: [CommonModule,FormsModule,MatIcon,RouterModule],
    templateUrl: './eventos-deportista.component.html',
    styleUrl: './eventos-deportista.component.css'
})
export class EventosDeportistaComponent implements OnInit{
  private eservice = inject(EventoService)
  private efservice = inject(EventoFechaService)
  private eeservice = inject(EventoEquipoService)
  private dservice = inject(DeportistaService)
  filtroEstado: string = 'all';
  mesActual: Date = new Date();
  nombre: string | null = '';
  apellido: string | null = '';
  deporte: string = '';
  posicion: string | null = ''
  fotoPerfil: string = "http://localhost:8080/";
  eventos: Evento[] = [];
  cargando = true;
  modalAbierto = false;
  cargandoFechas = false;
  fechasEvento: EventoFecha[] = [];
  eventoIdActual: number | null = null;
  busqueda: string = '';
  eventosFiltrados: Evento[] = [];
  vistaCalendario: boolean = false;
   eventoSeleccionado: Evento | null = null;
    tabActiva: 'fechas' | 'equipos' = 'fechas';
      equiposParticipantes: Equipo[] = [];
        cargandoEquipos: boolean = false;
         diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
         diasCalendario: any[] = [];
           hoy: Date = new Date();
           showUserDropdown: boolean = false;
  usuarioNombre: string = 'Lionel Messi'; // Ejemplo, obtener de servicio
  usuarioFoto: string = 'assets/user-default.jpg';

  navigation = [
  { name: 'CheckIn de Hoy', route: '../check', icon: 'event' },
  { name: 'Principal', route: '..', icon: 'home' },
  { name: 'Equipos', route: '../equipos', icon: 'groups' },
  { name: 'Rutinas', route: '../rutinas', icon: 'fitness_center' },
  { name: 'Rendimiento', route: '../rendimiento', icon: 'analytics' }
];
constructor(public router:Router){}
  ngOnInit(): void {
    const token = localStorage.getItem("token")
    const id = Number(localStorage.getItem("id"))
    if(!token) {
      throw new Error("Not Token Found")
    }
    this.eservice.listEventosByDeportista(id,token).subscribe({
      next:(data)=>{
        this.eventos=data
        this.eventosFiltrados = this.eventos
        this.aplicarFiltros()
         this.generarCalendario();
        this.cargando = false;
      },
      error:(err)=>{
        console.error(err)
        this.cargando = false;
      }
    })
    this.loadUserData()
  }
  
  loadUserData(): void {
    const nombre = localStorage.getItem('nombre');
    const apellido = localStorage.getItem('apellido');
    const fotoPerfil = localStorage.getItem('fotoPerfil');
    
    this.nombre = nombre || '';
    this.apellido = apellido || '';
    this.fotoPerfil = fotoPerfil ? `http://localhost:8080/${fotoPerfil}` : this.fotoPerfil;
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
  toggleUserDropdown(): void {
    this.showUserDropdown = !this.showUserDropdown;
  }

  logout(): void {
    this.showUserDropdown = false;
  }
  generarCalendario(): void {
    const start = new Date(this.mesActual.getFullYear(), this.mesActual.getMonth(), 1);
    const end = new Date(this.mesActual.getFullYear(), this.mesActual.getMonth() + 1, 0);
    
    this.diasCalendario = [];
    const primerDia = start.getDay();
    for (let i = 0; i < primerDia; i++) {
      const fecha = new Date(start);
      fecha.setDate(fecha.getDate() - (primerDia - i));
      this.diasCalendario.push({
        fecha: new Date(fecha),
        esMesActual: false,
        eventos: []
      });
    }
    for (let i = 1; i <= end.getDate(); i++) {
      const fecha = new Date(this.mesActual.getFullYear(), this.mesActual.getMonth(), i);
      const eventosDia = this.eventos.filter(e => 
        new Date(e.fecha).toDateString() === fecha.toDateString()
      );
      
      this.diasCalendario.push({
        fecha: fecha,
        esMesActual: true,
        eventos: eventosDia
      });
    }
    const ultimoDia = end.getDay();
    for (let i = 1; i < (7 - ultimoDia); i++) {
      const fecha = new Date(end);
      fecha.setDate(fecha.getDate() + i);
      this.diasCalendario.push({
        fecha: new Date(fecha),
        esMesActual: false,
        eventos: []
      });
    }
  }
  aplicarFiltros(): void {
    this.eventosFiltrados = this.eventos.filter(evento => {
      const coincideEstado = this.filtroEstado === 'all' || evento.estado === this.filtroEstado;
      const coincideBusqueda = evento.nombre.toLowerCase().includes(this.busqueda.toLowerCase()) ||
        evento.ubicacion.toLowerCase().includes(this.busqueda.toLowerCase());
         this.generarCalendario();
      return coincideEstado && coincideBusqueda;
    });
  }

  cambiarMes(direccion: number): void {
    this.mesActual = new Date(
      this.mesActual.getFullYear(),
      this.mesActual.getMonth() + direccion,
      1
    );
    this.generarCalendario();
  }
  toggleVistaCalendario(): void {
    this.vistaCalendario = !this.vistaCalendario;
  }

   getImagenEvento(evento: Evento): string {
      return evento.imagen 
        ? `http://localhost:8080/${evento.imagen}`
        : 'assets/default-event.jpg';
    }
  abrirModalFechas(eventoId: number): void {
    const token = localStorage.getItem("token")
    const id = Number(localStorage.getItem("id"))
    if(!token) {
      throw new Error("Not Token Found")
    }
    this.cargandoFechas = true;
    this.modalAbierto = true;
    this.efservice.list(eventoId,token).subscribe({
      next:(data)=>{
        this.fechasEvento=data
        console.log(data)
      },
      error:(err)=>{
        this.cargandoFechas = false;
        console.error(err)
      }
    })
    this.eeservice.listEquiposEvento(eventoId,token).subscribe({
      next:(data)=>{
        this.equiposParticipantes=data
          console.log(data)
        this.cargandoFechas = false
      },
      error:(err)=>{
        this.cargandoFechas = false;
        console.error(err)
      }
    })
  }

  cerrarModal(): void {
    this.modalAbierto = false;
    this.fechasEvento = [];
    this.eventoIdActual = null;
  }
}
