import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventoFecha } from '../../../models/eventoFecha.model';
import { EventoService } from '../../../services/evento.service';
import { Evento } from '../../../models/evento.model';
import { EventoFechaService } from '../../../services/eventoFecha.service';
import { RouterModule } from '@angular/router'; 
import { MatDialog } from '@angular/material/dialog';
import { EventoEditarComponent } from './evento-editar/evento-editar.component';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIcon } from '@angular/material/icon';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { OrganizacionService } from '../../../services/organizacion.service';
@Component({
    selector: 'app-eventos-organizacion',
    imports: [CommonModule, RouterModule, MatNativeDateModule,MatIcon ],
    templateUrl: './eventos-organizacion.component.html',
    styleUrl: './eventos-organizacion.component.css'
})
export class EventosOrganizacionComponent {
  private eservice = inject(EventoService)
    private efservice = inject(EventoFechaService)
    private oservice = inject(OrganizacionService)
    private dialog = inject(MatDialog)
    eventos: Evento[] = [];
    cargando = true;
    nombre_organizacion: string = ""
    modalAbierto = false;
    cargandoFechas = false;
    fechasEvento: EventoFecha[] = [];
    eventoIdActual: number | null = null;
    showUserDropdown: boolean = false;
    fotoPerfil: string = "http://localhost:8080/";
    nombre: string = ''
    navigation = [
  { name: 'Crear Eventos', route: '../crear-eventos', icon: 'add' },
  { name: 'Principal', route: '..', icon: 'home' },
  { name: 'Equipos', route: '../equipos-org', icon: 'groups' },
  { name: 'Estadisticas', route: '../estadistica-org', icon: 'analytics' },
  { name: 'Instructores', route: '../instructor', icon: 'fitness_center' }
];
    tabs = [
    { id: 'planificados', label: 'Planificados', icon: 'event_note' },
    { id: 'activos', label: 'Activos', icon:'event_available' },
    { id: 'pasados', label: 'Pasados' , icon: 'history'}
    ];
  eventosPlanificados: Evento[] = [];
  eventosActivos: Evento[] = [];
  eventosPasados: Evento[] = [];
  currentTab: string = 'planificados';
   private subscriptions: Subscription = new Subscription();
  constructor(public router: Router){}
    ngOnInit(): void {
      if (!this.isAuthenticated()) {
      this.showAuthError();
    }
      this.cargarEventos();
      this.loadUserData()
    }
    private isAuthenticated(): boolean {
        return !!localStorage.getItem('token');
      }
      private showAuthError(): void {
        Swal.fire({
          title: 'Sesión expirada',
          text: 'Por favor inicie sesión nuevamente',
          icon: 'error',
          confirmButtonText: 'Ir a login'
        }).then(() => {
          this.router.navigate(['/login']);
        });
      }
    loadUserData(): void {
    const nombre = localStorage.getItem('nombre');
    const fotoPerfil = localStorage.getItem('fotoPerfil');
    
    this.nombre = nombre || '';
    this.fotoPerfil = fotoPerfil ? `http://localhost:8080/${fotoPerfil}` : this.fotoPerfil;
  }
    cargarEventos() {
      const token = localStorage.getItem("token")
      const id = Number(localStorage.getItem("id"))
      if(!token) {
        this.mostrarErrorSesion();
        throw new Error("Not Token Found")
      }
      this.cargando = true;
      const sub =  this.eservice.listEventosByOrganizacion(id,token).subscribe({
        next:(data)=>{
          this.eventos=data
          this.clasificarEventos(data);
          this.cargando = false;
        },
        error:(err)=>{
          console.error(err);
        this.cargando = false;
        this.mostrarError('Error al cargar eventos', 'No se pudieron obtener los eventos. Intente nuevamente.');
        }
      })
      this.subscriptions.add(sub);
    }
    ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
    clasificarEventos(eventos: Evento[]): void {
      const ahora = new Date();
      this.eventosPlanificados = eventos.filter(evento => {
        const fechaEvento = new Date(evento.fecha);
        return fechaEvento > ahora && evento.estado === 'PLANIFICADO';
      });
  
      this.eventosActivos = eventos.filter(evento => {
        const fechaEvento = new Date(evento.fecha);
        return fechaEvento <= ahora && evento.estado === 'ACTIVO';
      });
  
      this.eventosPasados = eventos.filter(evento => {
        const fechaEvento = new Date(evento.fecha);
        return fechaEvento < ahora && evento.estado !== 'ACTIVO';
      });
    }
    getEventCount(tabId: string): number {
      switch(tabId) {
        case 'planificados': return this.eventosPlanificados.length;
        case 'activos': return this.eventosActivos.length;
        case 'pasados': return this.eventosPasados.length;
        default: return 0;
      }
    }
      cerrarSesion() {
       Swal.fire({
        title: '¿Estás seguro?',
        text: '¿Quieres cerrar sesión?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, cerrar sesión',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          this.oservice.logOut();
          this.router.navigate(['/login']);
          Swal.fire('Sesión cerrada', '', 'success');
        }
      });
      }
      toggleUserDropdown() {
  this.showUserDropdown = !this.showUserDropdown;
}
    abrirModalFechas(eventoId: number): void {
      const token = localStorage.getItem("token")
      const id = Number(localStorage.getItem("id"))
      if(!token) {
        this.mostrarErrorSesion();
        throw new Error("Not Token Found")
      }
      this.cargandoFechas = true;
      this.modalAbierto = true;
      const sub = this.efservice.list(eventoId,token).subscribe({
        next:(data)=>{
          this.fechasEvento=data
          console.log(data)
          this.cargandoFechas = false
        },
        error:(err)=>{
          this.cargandoFechas = false;
          console.error(err)
          this.mostrarError('Error al cargar fechas', 'No se pudieron obtener las fechas del evento.');
        }
      })
      this.subscriptions.add(sub);
    }
  
    cerrarModal(): void {
      this.modalAbierto = false;
      this.fechasEvento = [];
      this.eventoIdActual = null;
    }
    editarEvento(evento:Evento):void{
      const id = Number(localStorage.getItem("id"))
      const idDeporte = Number(localStorage.getItem("idDeporte"))
      if (!id || !idDeporte) {
      this.mostrarErrorSesion();
      return;
    }
      const dialogRef = this.dialog.open(EventoEditarComponent, {
        width: '800px',
        data: { 
          evento: evento,
          idOrganizacion: id,
          idDeporte:idDeporte
        }
      });
      const sub = dialogRef.afterClosed().subscribe(result => {
        if (result === 'actualizado') {
          this.cargarEventos();
        this.mostrarExito('Evento actualizado', 'El evento se ha actualizado correctamente');
        }
      });
    }
    async eliminarEvento(evento: Evento): Promise<void> {
    const token = localStorage.getItem("token");
    
    if (!token) {
      this.mostrarErrorSesion();
      return;
    }

    const confirmResult = await Swal.fire({
      title: '¿Eliminar evento?',
      text: `¿Estás seguro de eliminar el evento "${evento.nombre}"? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (confirmResult.isConfirmed) {
      Swal.fire({
        title: 'Eliminando evento...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });

      const sub = this.eservice.delete(evento.id, token).subscribe({
        next: (data) => {
          if (data.success) {
            Swal.close();
            this.cargarEventos();
            this.mostrarExito('Evento eliminado', 'El evento se ha eliminado correctamente');
          } else {
            Swal.close();
            this.mostrarError('Error al eliminar', data.message || 'No se pudo eliminar el evento');
          }
        },
        error: (err) => {
          Swal.close();
          console.error(err);
          this.mostrarError('Error al eliminar', 'Ocurrió un error al intentar eliminar el evento');
        }
      });
      
      this.subscriptions.add(sub);
    }
  }
    private mostrarError(titulo: string, mensaje: string): void {
    Swal.fire({
      title: titulo,
      text: mensaje,
      icon: 'error',
      confirmButtonText: 'Aceptar'
    });
  }

  private mostrarExito(titulo: string, mensaje: string): void {
    Swal.fire({
      title: titulo,
      text: mensaje,
      icon: 'success',
      confirmButtonText: 'Aceptar',
      timer: 3000
    });
  }

  private mostrarErrorSesion(): void {
    this.mostrarError('Sesión expirada', 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.');
    this.cerrarSesion();
  }
}
