import { Component, inject } from '@angular/core';
import { RutinaDTOR } from '../../../models/rutinaDTOr.model';
import { RouterModule } from '@angular/router'; 
import { CommonModule } from '@angular/common';
import { RutinaService } from '../../../services/rutina.service';
import { CheckInRutinaService } from '../../../services/checkinrutina.service';
import { CheckInRutinaDTO } from '../../../models/checkinRutinaDTO.model';

@Component({
    selector: 'app-check',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './check.component.html',
    styleUrl: './check.component.css'
})
export class CheckComponent {
    rutinasHoy: RutinaDTOR[] = [];
    fechaActual: Date = new Date();
    private rservice = inject(RutinaService)
    private chservice = inject (CheckInRutinaService)
    comentarios : string = ""
  
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
  
    marcarCompletada(rutinaid: number | undefined): void {
      const token=localStorage.getItem("token")
      const id = Number(localStorage.getItem("id"))
      console.log(localStorage)
      if(!token) {
        throw new Error("Not Token Found")
      }
      const nuevoCheckin: CheckInRutinaDTO = {
                            idrutina: rutinaid,
                            idjugador: id,
                            comentarios: this.comentarios
                          };
      console.log(nuevoCheckin)                    
      this.chservice.add(nuevoCheckin,token).subscribe({
        next: (data)=>{
          alert("Rutina vinculada correctamente");
        }, 
        error: (err)=>{
          console.error("Error al vincular rutina", err);
        }
      })

    }
  
    desmarcarCompletada(): void {
      
    }
  }
