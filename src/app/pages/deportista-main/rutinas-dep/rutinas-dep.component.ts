import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RutinaService } from '../../../services/rutina.service';
import { RutinaDTO } from '../../../models/rutinaDTO.model';
import { RutinaDTOR } from '../../../models/rutinaDTOr.model';
@Component({
  selector: 'app-rutinas-dep',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rutinas-dep.component.html',
  styleUrl: './rutinas-dep.component.css'
})
export class RutinasDepComponent implements OnInit{
  private rservice = inject(RutinaService)
  diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  diaFiltrado = 'TODOS';
  rutinas: RutinaDTOR[] = [];
  rutinasFiltradas: any[] = [];
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
    this.rservice.getRutinasEjerciciosRecursos(id, token).subscribe({
      next:(data)=>{
        console.log(data)
        console.log("hola")
        this.rutinas = data 
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

  }

  getSafeUrl(url: string) {
  }

  registrarCheckin(rutinaId: number) {

  }
}
