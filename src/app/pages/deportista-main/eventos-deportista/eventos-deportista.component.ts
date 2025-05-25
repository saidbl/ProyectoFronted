import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventoFecha } from '../../../models/eventoFecha.model';
import { EventoService } from '../../../services/evento.service';
import { Evento } from '../../../models/evento.model';
import { EventoFechaService } from '../../../services/eventoFecha.service';
import { FormsModule } from '@angular/forms';
import { Equipo } from '../../../models/equipo.model';
@Component({
    selector: 'app-eventos-deportista',
    standalone:true,
    imports: [CommonModule,FormsModule],
    templateUrl: './eventos-deportista.component.html',
    styleUrl: './eventos-deportista.component.css'
})
export class EventosDeportistaComponent implements OnInit{
  private eservice = inject(EventoService)
  private efservice = inject(EventoFechaService)
  filtroEstado: string = 'all';
  mesActual: Date = new Date();
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
    
    // Rellenar días del mes anterior
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

    // Generar días del mes actual
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

    // Rellenar días del siguiente mes
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
