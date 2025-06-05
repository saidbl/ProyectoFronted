import { Component, inject } from '@angular/core';
import { RutinaDTOR } from '../../../models/rutinaDTOr.model';
import { Router, RouterModule } from '@angular/router'; 
import { CommonModule } from '@angular/common';
import { RutinaService } from '../../../services/rutina.service';
import { CheckInRutinaService } from '../../../services/checkinrutina.service';
import { CheckInRutinaDTO } from '../../../models/checkinRutinaDTO.model';
import { MatIcon } from '@angular/material/icon';
import Swal from 'sweetalert2';
import { DeportistaService } from '../../../services/deportista.service';
import { forkJoin, Subject, takeUntil } from 'rxjs';
import { CheckInRutina } from '../../../models/checkinRutina.model';
@Component({
    selector: 'app-check',
    standalone: true,
    imports: [CommonModule, RouterModule,MatIcon],
    templateUrl: './check.component.html',
    styleUrl: './check.component.css'
})
export class CheckComponent {
  nombre: string | null = '';
  apellido: string | null = '';
  fotoPerfil: string = "http://localhost:8080/";
    showUserDropdown: boolean = false;
  showNotification: boolean = false;
    rutinasHoy: RutinaDTOR[] = [];
    fechaActual: Date = new Date();
    private rservice = inject(RutinaService)
    private chservice = inject (CheckInRutinaService)
    private dservice = inject(DeportistaService)
    completadas : CheckInRutina[] =[]
    incompletas : CheckInRutina[] = []
    comentarios : string = ""
    filterType:string = ""
      isLoading: boolean = true;
  hasError: boolean = false;
  notificationMessage: string = '';
   comentarioMap: Map<number, string> = new Map(); 
    private destroy$ = new Subject<void>(); 
     navigation = [
  { name: 'CheckIn de Hoy', route: 'check', icon: 'event' },
  { name: 'Deportistas', route: 'rutinaDeportista', icon: 'people' },
  { name: 'Equipos', route: 'crearEquipos', icon: 'groups' },
  { name: 'Rutinas', route: 'rutinas', icon: 'fitness_center' },
  { name: 'Reportes', route: 'reportes', icon: 'analytics' }
];
  
    constructor(public router:Router) {}
  
ngOnInit(): void {
    this.validateSession();
    this.loadUserData();
    this.loadCheckData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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

  loadUserData(): void {
    const nombre = localStorage.getItem('nombre');
    const apellido = localStorage.getItem('apellido');
    const fotoPerfil = localStorage.getItem('fotoPerfil');
    
    this.nombre = nombre || '';
    this.apellido = apellido || '';
    this.fotoPerfil = fotoPerfil ? `http://localhost:8080/${fotoPerfil}` : this.fotoPerfil;
  }

  loadCheckData(): void {
    const token = localStorage.getItem('token');
    const id = Number(localStorage.getItem('id'));
    
    if (!token || !id) {
      this.handleError('No se encontraron credenciales. Inicie sesión nuevamente');
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.hasError = false;

    forkJoin({
      rutinas: this.rservice.getRutinasByEjerciciosAndDia(id, token),
      completadas: this.chservice.list(id, token),
      incompletas: this.chservice.listIncompletas(id, token)
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (data) => {
        this.completadas = data.completadas;
        this.incompletas = data.incompletas;
        const hoy = new Date()
        hoy.setDate(hoy.getDate()-1)
        const hoyStr = this.formatDate(hoy);
        this.rutinasHoy = data.rutinas.filter(rutina => {
          const fueCompletadaHoy = this.completadas.some(completada => {
            const fechaCompStr = this.formatDate(new Date(completada.fecha));
            return completada.rutina.id === rutina.id && fechaCompStr === hoyStr;
          });
          return !fueCompletadaHoy;
        });
        
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading data', err);
        this.handleError('Error al cargar las rutinas. Intente nuevamente');
        this.isLoading = false;
      }
    });
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  toggleRecursos(ejercicioId: number | undefined): void {
    if (ejercicioId === undefined) return;
    
    this.rutinasHoy.forEach(rutina => {
      const ejercicio = rutina.ejercicios.find(e => e.id === ejercicioId);
      if (ejercicio) {
        ejercicio.mostrarRecursos = !ejercicio.mostrarRecursos;
      }
    });
  }
  
  toggleEjercicios(rutinaId: number | undefined): void {
    if (rutinaId === undefined) return;
    
    const rutina = this.rutinasHoy.find(r => r.id === rutinaId);
    if (rutina) {
      rutina.mostrarEjercicios = !rutina.mostrarEjercicios;
    }
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
      cancelButtonText: 'Cancelar',
      customClass: {
        container: 'custom-swal-container'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.dservice.logOut();
        this.router.navigate(['/login']);
        Swal.fire({
          title: 'Sesión cerrada',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          background: '#f4f4f4',
          backdrop: 'rgba(0,0,0,0.1)'
        });
      }
    });
  }

  updateComentario(rutinaId: number, comentario: string): void {
    this.comentarioMap.set(rutinaId, comentario);
  }

  marcarCompletada(rutinaid: number | undefined): void {
    if (rutinaid === undefined) {
      Swal.fire({
        title: 'Error',
        text: 'No se pudo identificar la rutina',
        icon: 'error',
        confirmButtonColor: '#3085d6'
      });
      return;
    }
    
    const token = localStorage.getItem('token');
    const id = Number(localStorage.getItem('id'));
    const comentario = this.comentarioMap.get(rutinaid) || '';
    
    if (!token || !id) {
      this.handleError('No se encontraron credenciales. Inicie sesión nuevamente');
      return;
    }
    
    const nuevoCheckin: CheckInRutinaDTO = {
      idrutina: rutinaid,
      idjugador: id,
      comentarios: comentario
    };
    
    Swal.fire({
      title: 'Marcar como completada',
      text: '¿Estás seguro de que has completado esta rutina?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, completada',
      cancelButtonText: 'Cancelar',
      customClass: {
        container: 'custom-swal-container'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.chservice.add(nuevoCheckin, token).subscribe({
          next: (data) => {
            Swal.fire({
              title: '¡Completada!',
              text: 'La rutina ha sido marcada como completada',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false,
              background: '#f4f4f4',
              backdrop: 'rgba(0,0,0,0.1)'
            });
            
            // Limpiar comentario
            this.comentarioMap.delete(rutinaid);
            
            // Recargar datos
            this.loadCheckData();
          }, 
          error: (err) => {
            console.error('Error al marcar la rutina', err);
            Swal.fire({
              title: 'Error',
              text: 'No se pudo marcar la rutina como completada',
              icon: 'error',
              confirmButtonColor: '#3085d6'
            });
          }
        });
      }
    });
  }

  handleError(message: string): void {
    this.hasError = true;
    this.showNotification = true;
    this.notificationMessage = message;
    
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: message,
      timer: 3000,
      showConfirmButton: false,
      background: '#f4f4f4',
      backdrop: 'rgba(0,0,0,0.1)'
    });
    
    setTimeout(() => this.showNotification = false, 5000);
  }

  // Método para manejar rutinas sin completar
  handleRutinasSinCompletar(): void {
    if (!this.isLoading && this.rutinasHoy.length === 0) {
      Swal.fire({
        title: '¡Buen trabajo!',
        text: 'No tienes rutinas pendientes para hoy',
        icon: 'success',
        confirmButtonColor: '#3085d6',
        background: '#f4f4f4'
      });
    }
  }
  }
