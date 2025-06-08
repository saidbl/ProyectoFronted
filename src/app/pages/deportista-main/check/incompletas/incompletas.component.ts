import { Component,inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CheckInRutinaService } from '../../../../services/checkinrutina.service';
import { CheckInRutina } from '../../../../models/checkinRutina.model';
import { MatIcon } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
@Component({
  selector: 'app-incompletas',
  imports: [CommonModule,MatIcon,RouterModule],
  templateUrl: './incompletas.component.html',
  styleUrl: './incompletas.component.css'
})
export class IncompletasComponent implements OnInit{
  private chservice = inject(CheckInRutinaService)
  checkins: CheckInRutina[] = [];
  idJugador: number = 0;
  loading = true;
  error = false;

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
  }

  cargarCheckinsCompletados(): void {
    
  }

  formatearEstado(estado: string): string {
    return estado.charAt(0) + estado.slice(1).toLowerCase();
  }
}
