import { Component,inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CheckInRutinaService } from '../../../../services/checkinrutina.service';
import { CheckInRutina } from '../../../../models/checkinRutina.model';
import { MatIcon } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { DeportistaService } from '../../../../services/deportista.service';
@Component({
  selector: 'app-incompletas',
  imports: [CommonModule,MatIcon,RouterModule],
  templateUrl: './incompletas.component.html',
  styleUrl: './incompletas.component.css'
})
export class IncompletasComponent implements OnInit{
  nombre: string | null = '';
  apellido: string | null = '';
  fotoPerfil: string = "http://localhost:8080/";
  private chservice = inject(CheckInRutinaService)
  showUserDropdown: boolean = false;
  showNotification: boolean = false;
  checkins: CheckInRutina[] = [];
  idJugador: number = 0;
  loading = true;
  error = false;
  private dservice = inject(DeportistaService)

   navigation = [
  { name: 'CheckIn de Hoy', route: '..', icon: 'event' },
  { name: 'Eventos', route: '../../proximoseventos', icon: 'event' },
  { name: 'Equipos', route: '../../equipos', icon: 'groups' },
  { name: 'Rutinas', route: '../../rutinas', icon: 'fitness_center' },
  { name: 'Rendimiento', route: '../../rendimiento', icon: 'analytics' }
];
  constructor(public router: Router) {}

  ngOnInit(): void {
    const id = Number(localStorage.getItem("id"))
    const token = localStorage.getItem("token")
    if(!token){
      throw new Error("Not Token Found")
    }
    this.chservice.listIncompletas(id,token).subscribe({
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

  formatearEstado(estado: string): string {
    return estado.charAt(0) + estado.slice(1).toLowerCase();
  }
  loadUserData(): void {
    const nombre = localStorage.getItem('nombre');
    const apellido = localStorage.getItem('apellido');
    const fotoPerfil = localStorage.getItem('fotoPerfil');
    
    this.nombre = nombre || '';
    this.apellido = apellido || '';
    this.fotoPerfil = fotoPerfil ? `http://localhost:8080/${fotoPerfil}` : this.fotoPerfil;
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
