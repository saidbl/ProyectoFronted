import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { RutinaDTO } from '../../../models/rutinaDTO.model';
import { RutinaDTOR } from '../../../models/rutinaDTOr.model';
import { RouterModule } from '@angular/router'; 
import { CommonModule } from '@angular/common';

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
  
    constructor(
    ) {}
  
    ngOnInit(): void {
      this.cargarRutinasHoy();
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
