import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RutinaService } from '../../../services/rutina.service';
import { RutinaDTO } from '../../../models/rutinaDTO.model';
import { RutinaDTOR } from '../../../models/rutinaDTOr.model';
@Component({
    selector: 'app-rutinas-dep',
    standalone:true,
    imports: [CommonModule],
    templateUrl: './rutinas-dep.component.html',
    styleUrl: './rutinas-dep.component.css'
})
export class RutinasDepComponent implements OnInit{
  private rservice = inject(RutinaService)
  diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'];
  diaFiltrado = 'TODOS';
  rutinas: RutinaDTOR[] = [];
  rutinasFiltradas: RutinaDTOR[] = [];
  nombre: string = '';
  apellido: string = '';
  posicion: string|null = '';
  deporte: string = '';


  ngOnInit(): void {
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
        this.filtrarPorDia("TODOS")
      },
      error:(err)=>{
        console.error(err)
      }
    })

  }

  cargarDatosDeportista() {

  }

  cargarRutinas() {

  }

  filtrarPorDia(dia: string) {
    if(dia == "TODOS"){
      this.rutinasFiltradas = this.rutinas
    }else{
    this.rutinasFiltradas = this.rutinas.filter(r=> r.dia == dia)
    }
  }

  getSafeUrl(url: string) {
  }

  registrarCheckin(rutinaId: number) {

  }
  // Para alternar la visualización de ejercicios
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
