import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventoFecha } from '../../../models/eventoFecha.model';
import { EventoDeportistaDTO } from '../../../models/eventoDeportista.model';
import { EventoService } from '../../../services/evento.service';
@Component({
  selector: 'app-eventos-deportista',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './eventos-deportista.component.html',
  styleUrl: './eventos-deportista.component.css'
})
export class EventosDeportistaComponent implements OnInit{
  private eservice = inject(EventoService)
  eventos: EventoDeportistaDTO[] = [];
  cargando = false;
  ngOnInit(): void {
    const token = localStorage.getItem("token")
    const id = Number(localStorage.getItem("id"))
    if(!token) {
      throw new Error("Not Token Found")
    }
    this.eservice.listarEventosDeportista(id,token).subscribe({
      next:(data)=>{
        this.eventos=data
      },
      error:(err)=>{
        console.error(err)
      }
    })
  }

}
