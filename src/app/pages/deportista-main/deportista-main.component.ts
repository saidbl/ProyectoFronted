import { Component, OnInit , inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Evento } from '../../models/evento.model';
import { EventoService } from '../../services/evento.service';
import { RouterModule } from '@angular/router'; 
import { RutinaService } from '../../services/rutina.service';
import { RutinaDTOR } from '../../models/rutinaDTOr.model';

@Component({
  selector: 'app-deportista-main',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './deportista-main.component.html',
  styleUrl: './deportista-main.component.css'
})
export class DeportistaMainComponent implements OnInit{
  private rservice = inject(RutinaService)
  private eservice = inject(EventoService)
  rutinasHoy: RutinaDTOR[] = [];
  porcentajeCumplimiento: number = 0;
  totalCheckins: number = 0;
  streakActual: number = 0;
  proximosEventos: Evento[] = [];
  ultimosCheckins: any[] = [];
  nombre : string | null = ""
  apellido : string | null = ""
  posicion : string | null = ""
  id : number = 0 
  ngOnInit(): void {
    const token=localStorage.getItem("token")
      const id = Number(localStorage.getItem("id"))
      console.log(localStorage)
      if(!token) {
        throw new Error("Not Token Found")
      }
    this.nombre= localStorage.getItem("nombre")
    this.apellido= localStorage.getItem("apellido")
    this.posicion= localStorage.getItem("posicion")
    this.rservice.getRutinasByEjerciciosAndDia(id,token).subscribe({
      next:(data)=>{
        console.log(data)
        this.rutinasHoy=data
      },
      error:(err)=>{
        console.log(err)
      }
    })
    this.eservice.listEventosByDeportista(id,token).subscribe({
      next:(data)=>{
        console.log(data)
        this.proximosEventos=data
      },
      error:(err)=>{
        console.log(err)
      }
    })
  }


  cargarDatosDeportista() {
    // Obtener datos del deportista logueado
  }

  cargarRutinasHoy() {

  }

  cargarEstadisticas() {

  }

  cargarProximoEvento() {

  }

  cargarUltimosCheckins() {

  }

  inicializarGraficos(stats: any) {

  }


  editarCheckin(id: number) {
    // Lógica para editar check-in
  }

  eliminarCheckin(id: number) {
    // Lógica para eliminar check-in
  }

}

