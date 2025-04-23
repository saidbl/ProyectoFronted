import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventoFecha } from '../../../models/eventoFecha.model';
import { EventoService } from '../../../services/evento.service';
import { Evento } from '../../../models/evento.model';
import { EventoFechaService } from '../../../services/eventoFecha.service';
@Component({
  selector: 'app-eventos-deportista',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './eventos-deportista.component.html',
  styleUrl: './eventos-deportista.component.css'
})
export class EventosDeportistaComponent implements OnInit{
  private eservice = inject(EventoService)
  private efservice = inject(EventoFechaService)
  eventos: Evento[] = [];
  cargando = true;
  modalAbierto = false;
  cargandoFechas = false;
  fechasEvento: EventoFecha[] = [];
  eventoIdActual: number | null = null;

  ngOnInit(): void {
    const token = localStorage.getItem("token")
    const id = Number(localStorage.getItem("id"))
    if(!token) {
      throw new Error("Not Token Found")
    }
    this.eservice.listEventosByDeportista(id,token).subscribe({
      next:(data)=>{
        this.eventos=data
        this.cargando = false;
      },
      error:(err)=>{
        console.error(err)
        this.cargando = false;
      }
    })
  }

  abrirModalFechas(eventoId: number): void {
    const token = localStorage.getItem("token")
    const id = Number(localStorage.getItem("id"))
    if(!token) {
      throw new Error("Not Token Found")
    }
    this.cargandoFechas = true;
    this.modalAbierto = true;
    this.efservice.list(eventoId,token).subscribe({
      next:(data)=>{
        this.fechasEvento=data
        console.log(data)
        this.cargandoFechas = false
      },
      error:(err)=>{
        this.cargandoFechas = false;
        console.error(err)
      }
    })
  }

  cerrarModal(): void {
    this.modalAbierto = false;
    this.fechasEvento = [];
    this.eventoIdActual = null;
  }
}
