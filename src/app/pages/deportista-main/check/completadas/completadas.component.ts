import { Component, OnInit, inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { CheckInRutinaService } from '../../../../services/checkinrutina.service';
import { CheckInRutina } from '../../../../models/checkinRutina.model';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
@Component({
    selector: 'app-completadas',
    imports: [CommonModule,MatIcon,RouterModule ],
    standalone : true,
    templateUrl: './completadas.component.html',
    styleUrl: './completadas.component.css'
})
export class CompletadasComponent implements OnInit{
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
    this.chservice.list(id,token).subscribe({
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
