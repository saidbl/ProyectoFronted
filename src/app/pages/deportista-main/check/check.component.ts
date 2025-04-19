import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RutinaDTO } from '../../../models/rutinaDTO.model';
import { RutinaDTOR } from '../../../models/rutinaDTOr.model';
import { RouterModule } from '@angular/router'; 
import { CommonModule } from '@angular/common';
import { DeportistaMainComponent } from '../deportista-main.component';
import { DeportistaService } from '../../../services/deportista.service';
import { Rutina } from '../../../models/rutina.model';
import { RutinaService } from '../../../services/rutina.service';

@Component({
  selector: 'app-check',
  standalone: true,
  imports: [CommonModule,RouterModule],
  templateUrl: './check.component.html',
  styleUrl: './check.component.css'
})
export class CheckComponent {
    rutinasHoy: RutinaDTOR[] = [];
    fechaActual: Date = new Date();
    private rservice = inject(RutinaService)
  
    constructor(
    ) {}
  
    ngOnInit(): void {
      const token=localStorage.getItem("token")
      const id = Number(localStorage.getItem("id"))
      console.log(localStorage)
      if(!token) {
        throw new Error("Not Token Found")
      }
    this.rservice.getRutinasByEjerciciosAndDia(id,token).subscribe({
      next:(data)=>{
        console.log(data)
        this.rutinasHoy= data
      },
      error:(err)=>{
        console.log(err)
      }
    })
    }
  
    cargarRutinasHoy(): void {
      
    }
  
    toggleEjercicios(rutinaId: number|undefined): void {
      const rutina = this.rutinasHoy.find(r => r.id === rutinaId);
      if (rutina) {
        rutina.mostrarEjercicios = !rutina.mostrarEjercicios;
      }
    }
  
    cargarEjerciciosRutina(rutinaId: number|undefined): void {
      // Implementar servicio para cargar ejercicios de la rutina
      console.log('Cargando ejercicios para rutina', rutinaId);
    }
  
    marcarCompletada(): void {
  
    }
  
    desmarcarCompletada(): void {
      
    }
  }
