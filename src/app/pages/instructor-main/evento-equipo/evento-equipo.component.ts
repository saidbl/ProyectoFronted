import { Component, OnInit,inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; 
import { Evento } from '../../../models/evento.model';
import { forkJoin } from 'rxjs';
import { EventoService } from '../../../services/evento.service';
import { Equipo } from '../../../models/equipo.model';
import { EventoEquipoDTO } from '../../../models/eventoEquipoDTO.model';
import { EventoEquipoService } from '../../../services/eventoEquipo.service';
import { EquipoService } from '../../../services/equipo.service';
import { EventoEquipo } from '../../../models/eventoEquipo.model';
@Component({
  selector: 'app-evento-equipo',
  standalone: true,
  imports: [FormsModule,CommonModule,RouterModule],
  templateUrl: './evento-equipo.component.html',
  styleUrl: './evento-equipo.component.css'
})
export class EventoEquipoComponent implements OnInit{
  private eservice= inject(EventoService)
  private eeservice = inject(EventoEquipoService)
  private eqservice = inject(EquipoService)
  eventoSeleccionado:any= null
  eventos : Evento[] = []
  terminoBusqueda: string = '';
  mostrarDetallesEvento = false
  mostrarModalAsociarEquipo = false
  equipoSeleccionado : number = 0
  equiposDisponibles : Equipo[] = []
  equiposInscritos : EventoEquipo[] = []
  equipos : Equipo[]=[]
  ngOnInit(): void {
    try{
      const token=localStorage.getItem("token")
      const idDeporte = Number(localStorage.getItem("idDeporte"))
      const idInstructor= Number(localStorage.getItem("id"))
      if(!token) {
        throw new Error("Not Token Found")
      }
      forkJoin({
        eventos: this.eservice.list(idDeporte, token),
        equipos: this.eqservice.list(idInstructor,token)
      }).subscribe({
        next: (data) => {
          this.eventos = data.eventos;
          this.equipos = data.equipos
        },
        error: (err) => {
          console.error("Error loading data", err);
        }
      });
      
    }catch(error:any){
      alert(error.message)
    }
  }
  filtrarEquipos(): void {
    if (!this.terminoBusqueda) {
      this.eventos = this.eventos;
    } else {
      this.eventos = this.eventos.filter((evento) =>
        evento.nombre.toLowerCase().includes(this.terminoBusqueda.toLowerCase())
      );
    }
  }
  verDetallesEvento(evento:Evento){
    this.eventoSeleccionado = evento
      this.mostrarDetallesEvento=true
    }
    abrirModalAsociarEquipo(evento:Evento){
      const token=localStorage.getItem("token")
    if(!token) {
      throw new Error("Not Token Found")
    }
    forkJoin({
      jugadorEquipo: this.eeservice.list(evento.id, token),
    }).subscribe({
      next: (data) => {
        this.equiposInscritos = data.jugadorEquipo;
        this.equiposDisponibles 
      },
      error: (err) => {
        console.error("Error loading data", err);
      }
    });
    this.eventoSeleccionado = evento
      this.mostrarModalAsociarEquipo=true
    }
    asociarEquipo(){
    console.log(this.equipoSeleccionado)
    console.log(this.eventoSeleccionado)
          if(this.eventoSeleccionado?.numMaxEquipos == this.eventoSeleccionado.equiposInscritos){
            console.error("Evento lleno")
          }else{
          if (this.equipoSeleccionado !== null) {
            const token=localStorage.getItem("token")
                if(!token) {
                  throw new Error("Not Token Found")
                }
                const nuevaVinculacion: EventoEquipoDTO = {
                      idEvento: this.eventoSeleccionado?.id,
                      idEquipo: this.equipoSeleccionado
                    };
                console.log(nuevaVinculacion.idEquipo)
                this.eeservice.add(nuevaVinculacion, token).subscribe({
                      next:(data)=>{
                        alert("Rutina vinculada correctamente");
                      },
                      error:(err)=>{
                        console.error("Error al vincular rutina", err);
                      }
                    })
            
            this.mostrarModalAsociarEquipo = false;
          } else {
            console.error('No se ha seleccionado ningún jugador');
          }
        }
    }

}
