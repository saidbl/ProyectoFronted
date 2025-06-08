import { Component, OnInit ,inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Equipo } from '../../../models/equipo.model';
import { EquipoService } from '../../../services/equipo.service';
import { MatIcon } from '@angular/material/icon';
import { Evento } from '../../../models/evento.model';
import { EventoService } from '../../../services/evento.service';
import { Router, RouterModule } from '@angular/router';
import { Deportista } from '../../../models/deportista.model';
import { forkJoin } from 'rxjs';
import { JugadorEquipoService } from '../../../services/jugadorequipo.service';
import { JugadorEquipo } from '../../../models/jugadorEquipo.model';
import Swal from 'sweetalert2';
import { EventoEquipoService } from '../../../services/eventoEquipo.service';
@Component({
    selector: 'app-equipos-deportista',
    standalone:true,
    imports: [CommonModule,MatIcon,RouterModule],
    templateUrl: './equipos-deportista.component.html',
    styleUrl: './equipos-deportista.component.css'
})
export class EquiposDeportistaComponent implements OnInit{
  private jeservice = inject(JugadorEquipoService)
  private eservice = inject(EquipoService)
  private evservice = inject(EventoService)
  private eeservice = inject(EventoEquipoService)
  mostrarModalAsociarJugador : boolean = false
  mostrarModalEventos : boolean = false
  equipoSeleccionado: Equipo|null=  null
  jugadores: JugadorEquipo[]=[]
  eventos : Evento[] =[]

  totalEventos : number = 0
  navigation = [
  { name: 'Principal', route: '..', icon: 'home' },
  { name: 'Eventos', route: '../proximoseventos', icon: 'event' },
  { name: 'Equipos', route: '../equipos', icon: 'groups' },
  { name: 'Rutinas', route: '../rutinas', icon: 'fitness_center' },
  { name: 'Rendimiento', route: '../rendimiento', icon: 'analytics' }
];
  constructor(public router: Router) {}
  ngOnInit(): void {
    const id = Number(localStorage.getItem("id"))
    const token = localStorage.getItem("token")
    if(!token) {
      throw new Error("Not Token Found")
    }
    this.eservice.listByIdDeportista(id,token).subscribe({
      next: (data)=>{
        this.equipos=data
      },
      error: (err)=>{
        console.error(err)
      }
    })
    this.evservice.listEventosByDeportista(id, token).subscribe({
      next: (data)=>{
        this.eventos=data
        this.totalEventos = this.eventos.length
      },
      error: (err)=>{
        console.error(err)
      }
    })
  }
  equipos: Equipo[]=[]
  abrirModalMiembros(equipo:Equipo){
    const token=localStorage.getItem("token")
        if(!token) {
          throw new Error("Not Token Found")
        }
        forkJoin({
          jugadorEquipo: this.jeservice.list(equipo.id, token),
        }).subscribe({
          next: (data) => {
            this.jugadores = data.jugadorEquipo;
          },
          error: (err) => {
            console.error("Error loading data", err);
            this.mostrarErrorSweetAlert('Error', 'No se pudieron cargar los jugadores disponibles');
          }
        });
        this.mostrarModalAsociarJugador = true
        this.equipoSeleccionado = equipo
  }
   abrirModalEventos(equipo:Equipo){
    const token=localStorage.getItem("token")
        if(!token) {
          throw new Error("Not Token Found")
        }
        forkJoin({
          eventos : this.eeservice.listEventosEquipo(equipo.id,token)
        }).subscribe({
          next: (data) => {
            this.eventos = data.eventos
          },
          error: (err) => {
            console.error("Error loading data", err);
            this.mostrarErrorSweetAlert('Error', 'No se pudieron cargar los jugadores disponibles');
          }
        });
        this.mostrarModalEventos = true
        this.equipoSeleccionado = equipo
  }
  mostrarErrorSweetAlert(titulo: string, mensaje: string): void {
      Swal.fire({
        title: titulo,
        text: mensaje,
        icon: 'error',
        confirmButtonColor: '#ef4444',
        background: '#1f2937',
        color: '#fff',
        iconColor: '#ef4444'
      });
    }


}
