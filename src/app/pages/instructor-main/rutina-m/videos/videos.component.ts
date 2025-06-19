import { Component, OnInit , inject} from '@angular/core';
import { RecursoRutina } from '../../../../models/recursoRutina.model';
import { RecursoService } from '../../../../services/recurso.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { EjercicioRutinaService } from '../../../../services/ejerciciorutina.service';
import { EjercicioRutina } from '../../../../models/ejercicioRutina.model';
import { MatIcon } from '@angular/material/icon';
import { Subject, takeUntil } from 'rxjs';
import Swal from 'sweetalert2';
import { InstructorService } from '../../../../services/instructor.service';
@Component({
    selector: 'app-videos',
    standalone:true,
    imports: [FormsModule, CommonModule, RouterModule,MatIcon],
    templateUrl: './videos.component.html',
    styleUrl: './videos.component.css'
})
export class VideosComponent implements OnInit{
  private recursoService = inject(RecursoService)
  private destroy$ = new Subject<void>();
  private eService = inject(EjercicioRutinaService)
  private iservice = inject(InstructorService)
  videos: any[] = [];
  nombreInst: string = '';
  apellido: string = '';
  fotoPerfil: string = "http://localhost:8080/";
  showNotification: boolean = false;
  notificationMessage: string = '';
  showUserDropdown: boolean = false;
    videoFile: File | null = null;
    ejercicioId = 0;
    recursos: RecursoRutina[] = [];
    archivo?: File;
    descripcion = '';
    loading = false
    ejercicios : EjercicioRutina[] = []
    constructor(public router:Router){}
  ngOnInit(): void {
    if (!this.isAuthenticated()) {
      this.showAuthError();
    }
     this.cargarDatos();
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
  ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
  private cargarDatos(){
    const fotoPerfil = localStorage.getItem("fotoPerfil")
      const nom=localStorage.getItem("nombre")
      const ap = localStorage.getItem("apellido")
    this.loading = true;
     try {
      const token=localStorage.getItem("token")
      const id = Number(localStorage.getItem("id"))
      if(!token) {
        this.mostrarErrorSweetAlert('Error de autenticación', 'Token no encontrado');
            this.loading = false;
            return;
      }
    this.recursoService.obtenerTodosRecursos( id ,token).pipe(takeUntil(this.destroy$)).subscribe({
      next:(data)=>{
        this.loading = false;
        this.recursos=data
        this.fotoPerfil = this.fotoPerfil+ fotoPerfil
                this.nombreInst=nom ?? ''
                this.apellido= ap ?? ''
      },
      error:(err)=>{
        console.error('Error cargando datos', err);
                this.mostrarErrorSweetAlert('Error', 'Error al cargar los datos');
                this.loading = false;
      }
    })
    this.eService.obtenerEjercicios( token, id).pipe(takeUntil(this.destroy$)).subscribe({
      next:(data)=>{
         this.loading = false;
        this.ejercicios=data
      },
      error:(err)=>{
        console.error('Error cargando datos', err);
                this.mostrarErrorSweetAlert('Error', 'Error al cargar los datos');
                this.loading = false;
      }
    })
  }catch(error:any){
    alert(error.message)
  }
  }
  toggleUserDropdown() {
  this.showUserDropdown = !this.showUserDropdown;
}
  seleccionarArchivo(event: any) {
    if (event.target.files && event.target.files.length > 0) {
            this.archivo = event.target.files[0];
        }
  }

  subirRecurso() {
    if (!this.validarSubida()) return;
    const token=localStorage.getItem("token")
    this.loading = true;
    if(!token) {
      this.mostrarErrorSweetAlert('Error', 'Token no encontrado');
            this.loading = false;
            return;
    }
    if (this.archivo) {
      this.recursoService.subirRecurso(this.ejercicioId, this.archivo, token, this.descripcion)
        .pipe(takeUntil(this.destroy$)).subscribe({
                next: () => {
                    this.mostrarExitoSweetAlert('Éxito', 'Recurso subido correctamente');
                    this.limpiarFormulario();
                    this.cargarDatos(); 
                },
                error: (err) => {
                    console.error('Error subiendo recurso', err);
                    this.mostrarErrorSweetAlert('Error', 'Error al subir el recurso');
                    this.loading = false;
                }
            });
    }
  }
 eliminarRecurso(id: number): void {
        Swal.fire({
            title: '¿Estás seguro?',
            text: 'Esta acción no se puede deshacer',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#ef4444',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            background: '#1f2937',
            color: '#fff'
        }).then((result) => {
            if (result.isConfirmed) {
                this.ejecutarEliminacion(id);
            }
        });
    }
    private ejecutarEliminacion(id: number): void {
        this.loading = true;
        const token = localStorage.getItem('token');
        
        if (!token) {
            this.mostrarErrorSweetAlert('Error', 'Token no encontrado');
            this.loading = false;
            return;
        }

        this.recursoService.eliminar(id, token)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data) => {
                  console.log(data)
                    if (data.success) {
                        this.mostrarExitoSweetAlert('Eliminado', 'Recurso eliminado correctamente');
                        this.cargarDatos(); 
                    } else {
                        this.mostrarErrorSweetAlert('Error', data.message || 'Error al eliminar el recurso');
                        this.loading = false;
                    }
                },
                error: (err) => {
                    console.error('Error eliminando recurso', err);
                    this.mostrarErrorSweetAlert('Error', 'Error al eliminar el recurso');
                    this.loading = false;
                }
            });
    }
   private validarSubida(): boolean {
        if (!this.ejercicioId) {
            this.mostrarAdvertenciaSweetAlert('Selección requerida', 'Debe seleccionar un ejercicio');
            return false;
        }
        if (!this.archivo) {
            this.mostrarAdvertenciaSweetAlert('Archivo requerido', 'Debe seleccionar un archivo');
            return false;
        }
        const validExtensions = ['video/mp4', 'video/webm', 'video/ogg'];
        if (!validExtensions.includes(this.archivo.type)) {
            this.mostrarAdvertenciaSweetAlert(
                'Formato no válido', 
                'Solo se permiten archivos de video (MP4, WebM, Ogg)'
            );
            return false;
        }
        const maxSize = 50 * 1024 * 1024; 
        if (this.archivo.size > maxSize) {
            this.mostrarAdvertenciaSweetAlert(
                'Archivo demasiado grande', 
                'El tamaño máximo permitido es 50MB'
            );
            return false;
        }

        return true;
    }
  private limpiarFormulario(): void {
        this.ejercicioId = 0;
        this.archivo = undefined;
        this.descripcion = '';
    }
    private mostrarExitoSweetAlert(titulo: string, mensaje: string): void {
        Swal.fire({
            title: titulo,
            text: mensaje,
            icon: 'success',
            confirmButtonColor: '#10b981',
            background: '#1f2937',
            color: '#fff',
            iconColor: '#10b981'
        });
    }

    private mostrarErrorSweetAlert(titulo: string, mensaje: string): void {
        Swal.fire({
            title: titulo,
            text: mensaje,
            icon: 'error',
            confirmButtonColor: '#ef4444',
            background: '#1f2937',
            color: '#fff',
            iconColor: '#ef4444'
        });
    }

    private mostrarAdvertenciaSweetAlert(titulo: string, mensaje: string): void {
        Swal.fire({
            title: titulo,
            text: mensaje,
            icon: 'warning',
            confirmButtonColor: '#f59e0b',
            background: '#1f2937',
            color: '#fff',
            iconColor: '#f59e0b'
        });
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
        this.iservice.logOut();
        this.router.navigate(['/login']);
        Swal.fire('Sesión cerrada', '', 'success');
      }
    });
    }
}
