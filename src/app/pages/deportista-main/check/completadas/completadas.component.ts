import { Component, OnInit, inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { CheckInRutinaService } from '../../../../services/checkinrutina.service';
import { CheckInRutina } from '../../../../models/checkinRutina.model';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { DeportistaService } from '../../../../services/deportista.service';
@Component({
    selector: 'app-completadas',
    imports: [CommonModule,MatIcon,RouterModule ],
    standalone : true,
    templateUrl: './completadas.component.html',
    styleUrl: './completadas.component.css'
})
export class CompletadasComponent implements OnInit{
  nombre: string | null = '';
  apellido: string | null = '';
  fotoPerfil: string = "http://localhost:8080/";
  private chservice = inject(CheckInRutinaService)
  checkins: CheckInRutina[] = [];
  idJugador: number = 0;
   private dservice = inject(DeportistaService)
  loading = true;
  error = false;
  showUserDropdown: boolean = false;
  showNotification: boolean = false;

  navigation = [
  { name: 'CheckIn de Hoy', route: '../', icon: 'event' },
  { name: 'Eventos', route: '../../proximoseventos', icon: 'event' },
  { name: 'Equipos', route: '../../equipos', icon: 'groups' },
  { name: 'Rutinas', route: '../../rutinas', icon: 'fitness_center' },
  { name: 'Rendimiento', route: '../../rendimiento', icon: 'analytics' }
];
  constructor(public router: Router) {}

  ngOnInit(): void {
    if (!this.isAuthenticated()) {
      this.showAuthError();
    }
    const id = Number(localStorage.getItem("id"))
    const token = localStorage.getItem("token")
    if(!token){
      throw new Error("Not Token Found")
    }
    this.chservice.list(id,token).subscribe({
      next: (data)=>{
        this.checkins = data
        console.log(data)
      },
      error: (err)=>{
        console.error(err)
      }
    })
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
    const apellido = localStorage.getItem('apellido');
    const fotoPerfil = localStorage.getItem('fotoPerfil');
    
    this.nombre = nombre || '';
    this.apellido = apellido || '';
    this.fotoPerfil = fotoPerfil ? `http://localhost:8080/${fotoPerfil}` : this.fotoPerfil;
  }

  formatearEstado(estado: string): string {
    return estado.charAt(0) + estado.slice(1).toLowerCase();
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
}
