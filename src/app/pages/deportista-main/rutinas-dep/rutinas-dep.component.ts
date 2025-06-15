import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RutinaService } from '../../../services/rutina.service';
import { RutinaDTOR } from '../../../models/rutinaDTOr.model';
import { MatIcon } from '@angular/material/icon';
import { Router , RouterModule} from '@angular/router';
import Swal from 'sweetalert2';
import { DeportistaService } from '../../../services/deportista.service';
@Component({
    selector: 'app-rutinas-dep',
    standalone:true,
    imports: [CommonModule,MatIcon,RouterModule],
    templateUrl: './rutinas-dep.component.html',
    styleUrl: './rutinas-dep.component.css'
})
export class RutinasDepComponent implements OnInit{
  private rservice = inject(RutinaService)
  private dservice = inject(DeportistaService)
  diasSemana = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'];
  nombre: string | null = '';
  apellido: string | null = '';
  fotoPerfil: string = "";
    showUserDropdown: boolean = false;
  showNotification: boolean = false;
  diaFiltrado = 'TODOS';
  rutinas: RutinaDTOR[] = [];
  rutinasFiltradas: RutinaDTOR[] = [];
  posicion: string|null = '';
  deporte: string = '';
  navigation = [
  { name: 'Principal', route: '..', icon: 'home' },
  { name: 'Eventos', route: '../proximoseventos', icon: 'event' },
  { name: 'Equipos', route: '../equipos', icon: 'groups' },
  { name: 'CheckIn', route: '../check', icon: 'event' },
  { name: 'Rendimiento', route: '../rendimiento', icon: 'analytics' }
];
  
    constructor(public router:Router) {}


  ngOnInit(): void {
    const nombre = localStorage.getItem('nombre');
    const apellido = localStorage.getItem('apellido');
    const foto = localStorage.getItem("fotoPerfil")
    console.log("hola")
    const id =Number(localStorage.getItem("id"))
    const token = localStorage.getItem("token")
    if(!token){
      throw new Error("Not Token Found")
    }
    this.posicion = localStorage.getItem("posicion")
    this.rservice.getRutinasEjerciciosRecursos(id, token).subscribe({
      next:(data)=>{
        console.log(data)
        console.log("hola")
        this.rutinas = data 
        this.nombre = nombre || '';
    this.apellido = apellido || '';
        this.fotoPerfil = "http://localhost:8080/"+foto
        console.log(this.fotoPerfil)
        this.filtrarPorDia("TODOS")
      },
      error:(err)=>{
        console.error(err)
      }
    })

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

  filtrarPorDia(dia: string) {
    this.diaFiltrado=dia
    if(dia == "TODOS"){
      this.rutinasFiltradas = this.rutinas
    }else{
    this.rutinasFiltradas = this.rutinas.filter(r=> r.dia == dia)
    }
  }
  getIconoObjetivo(objetivo: string): string {
  switch (objetivo?.toUpperCase()) {
    case 'FUERZA':
      return 'fitness_center';
    case 'RESISTENCIA':
      return 'directions_run';
    case 'VELOCIDAD':
      return 'speed';
    case 'FLEXIBILIDAD':
      return 'self_improvement';
    case 'TECNICA':
      return 'psychology';
    default:
      return 'sports';
  }
}
toggleEjercicios(rutinaId: number|undefined) {
  const rutina = this.rutinasFiltradas.find(r => r.id === rutinaId);
  if (rutina) {
    rutina.mostrarEjercicios = !rutina.mostrarEjercicios;
  }
}

// Para alternar la visualización de recursos
toggleRecursos(ejercicioId: number| undefined) {
  this.rutinasFiltradas.forEach(rutina => {
    const ejercicio = rutina.ejercicios.find(e => e.id=== ejercicioId);
    console.log(ejercicio?.id)
    if (ejercicio) {
      ejercicio.mostrarRecursos = !ejercicio.mostrarRecursos;
    }
  });
}
}
