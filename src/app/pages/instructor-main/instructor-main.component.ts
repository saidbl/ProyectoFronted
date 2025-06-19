import { Component, NgZone, OnInit , inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router'; 
import { RutinaService } from '../../services/rutina.service';
import { Rutina } from '../../models/rutina.model';
import { Equipo } from '../../models/equipo.model';
import { EquipoService } from '../../services/equipo.service';
import { DeportistaService } from '../../services/deportista.service';
import { Deportista } from '../../models/deportista.model';
import Swal from 'sweetalert2';
import { InstructorService } from '../../services/instructor.service';
import { MensajeDTO } from '../../models/mensajeDTO.model';
import { delay, filter, skipWhile, Subject, Subscription, switchMap, take, takeUntil } from 'rxjs';
import {  WsService } from '../../services/websocket.service';
import { UnreadMessagesService } from '../../services/unreadmessagesservice.service';
import { LocalTime } from '../../models/LocalTime';
@Component({
    selector: 'app-instructor-main',
    standalone:true,
    imports: [MatButtonModule, MatToolbarModule, MatCardModule, MatIconModule, MatInputModule,
        MatFormFieldModule, MatTableModule, MatPaginatorModule, MatSortModule, MatDialogModule,
        MatSnackBarModule, MatSidenavModule, MatListModule, MatSelectModule, MatTabsModule,
        MatDatepickerModule, MatNativeDateModule, FormsModule, RouterModule, CommonModule],
    templateUrl: './instructor-main.component.html',
    styleUrl: './instructor-main.component.css'
})
export class InstructorMainComponent implements OnInit {
  private rservice= inject(RutinaService)
  private eservice = inject(EquipoService)
  private dservice = inject(DeportistaService)
  private iservice = inject(InstructorService)
  totalRutinas:number = 0
  navigation = [
  { name: 'Eventos', route: 'equipoEvento', icon: 'event' },
  { name: 'Deportistas', route: 'rutinaDeportista', icon: 'people' },
  { name: 'Equipos', route: 'crearEquipos', icon: 'groups' },
  { name: 'Rutinas', route: 'rutinas', icon: 'fitness_center' },
  { name: 'Reportes', route: 'reportes', icon: 'analytics' }
];

constructor(public router: Router,private unreadMessagesService: UnreadMessagesService,
    private wsService: WsService) {}
  rutinas : Rutina[] = []
  nombre: string = '';
  apellido: string = '';
  fotoPerfil: string = "http://localhost:8080/";
  especialidad: string = '';
  experiencia: number = 0;
  totalDeportistas: number = 0;
  deportistasNuevos: number = 0;
  totalEquipos: number = 0;
  rutinasPendientes: number = 0;
  deportistas:Deportista[]=[]
  deportistasRecientes: Deportista[] = [];
  equiposActivos: Equipo[] = [];
  rutinasPendientesRevisar: any[] = [];
  rutinaFilter: string = 'all';
  showNotification: boolean = false;
  notificationMessage: string = '';
  showUserDropdown: boolean = false;
  mensajes : MensajeDTO[]=[]
  nuevosMensajes = 0;
  private destroy$ = new Subject<void>();
  
 ngOnInit() {
  if (!this.isAuthenticated()) {
      this.showAuthError();
    }
    
    try{
    const savedCount = localStorage.getItem('unreadMessages');
    const initialCount = savedCount ? parseInt(savedCount, 10) : 0;
    this.nuevosMensajes = initialCount;
    this.wsService.connect();
  this.wsService.connectionEstablished.pipe(
    filter(connected => connected),
    take(1),
    delay(150), 
    switchMap(() => this.wsService.getNotificationCount()),
    takeUntil(this.destroy$)
  ).subscribe(count => {
     this.nuevosMensajes = count;
          console.log('Notificaciones:', count);
        
          if (Number(localStorage.getItem("unreadMessages")) == 0) {
            localStorage.setItem('unreadMessages', count.toString());
          }
        
          this.nuevosMensajes = Number(localStorage.getItem("unreadMessages"));
  });
      const fotoPerfil = localStorage.getItem("fotoPerfil")
      const nom=localStorage.getItem("nombre")
      const ap = localStorage.getItem("apellido")
      console.log(fotoPerfil)
      const token=localStorage.getItem("token")
      const instructorId = Number(localStorage.getItem("id"))
      console.log(localStorage)
      if (!token) {
        Swal.fire({
            icon: 'warning',
            title: 'Sesión no válida',
            text: 'No se encontró el token de autenticación. Serás redirigido al login.',
            confirmButtonText: 'Aceptar'
          }).then(() => {
            this.router.navigate(['/login']);
          });
          return;
      }
      
      this.rservice.getTotalRutinasByInstructorId(instructorId,token).subscribe({
        next:(data)=>{
          console.log(data)
          if(data>=0){
          console.log(data)
          this.totalRutinas=data
          this.fotoPerfil = this.fotoPerfil+ fotoPerfil
          console.log(this.fotoPerfil)
          this.nombre=nom ?? ''
          this.apellido= ap ?? ''
          }
        },
        error:(err)=>{
          console.log(err)
        }
      })
      this.rservice.getTop3RutinasByInstructor(instructorId,token).subscribe({
        next:(data:Rutina [])=>{
          this.rutinas = data
        },
        error:(err)=>{
          console.log(err)
        }
      })
      this.eservice.list(instructorId,token).subscribe({
        next:(data)=>{
          this.equiposActivos=data
        },
        error:(error)=>{
          console.error(error)
        }
      })
      this.dservice.list(instructorId,token).subscribe({
        next:(data)=>{
          this.deportistas=data
          this.deportistasRecientes= this.deportistas.filter(deportista=>{
            const hoy = new Date()
            const fecha = new Date(deportista.fechaRegistro);
            const haceUnMes = new Date();
            haceUnMes.setMonth(hoy.getMonth() - 1);
             return fecha >= haceUnMes && fecha <= hoy;
          })

        },
        error:()=>{

        }
      })
    }catch(error:any){
      alert(error.message)
    }
    
    
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
  
  verNotificaciones() {
  localStorage.setItem('unreadMessages', "0");
  this.nuevosMensajes = 0;
  this.wsService.resetNotificationCount();
}
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  toggleUserDropdown() {
  this.showUserDropdown = !this.showUserDropdown;
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
  mostrarNotificacion(mensaje: string): void {
    this.notificationMessage = mensaje;
    this.showNotification = true;
    
    setTimeout(() => {
      this.showNotification = false;
    }, 3000);
  }

  
}

