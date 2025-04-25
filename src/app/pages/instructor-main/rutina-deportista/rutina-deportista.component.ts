import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DeportistaService } from '../../../services/deportista.service';
import { Deportista } from '../../../models/deportista.model';
import { CommonModule } from '@angular/common';
import { RutinaJugadorService } from '../../../services/rutinajugador.service';
import { RutinaJugador } from '../../../models/rutinajugador.model';
import { RutinaService } from '../../../services/rutina.service';
import { Rutina } from '../../../models/rutina.model';
import { RutinaJugadorDTO } from '../../../models/rutinaJugadorDTO.model';
import { forkJoin } from 'rxjs';
import { RouterModule } from '@angular/router'; 
@Component({
    selector: 'app-rutina-deportista',
    imports: [FormsModule, CommonModule, RouterModule],
    standalone: true,
    templateUrl: './rutina-deportista.component.html',
    styleUrl: './rutina-deportista.component.css'
})
export class RutinaDeportistaComponent implements OnInit{
  private dservice= inject(DeportistaService)
  private rservice = inject(RutinaJugadorService)
  private rtservice = inject(RutinaService)
  deportistas: Deportista[] = [];
  rutinasJugador: RutinaJugador[] = [];
  rutinas: Rutina[] = []
  jugadorSeleccionado: any = null;
  rutinaSeleccionada!: number;
  mostrarModal = false;
  deportista : Deportista | null = null;
  rutinasFiltradas : Rutina[]=[]
  mostrarRutinas = false;
  mostrarPerfil = false;
  searchTerm = '';



  ngOnInit() {
    try{
      const token=localStorage.getItem("token")
      const id = Number(localStorage.getItem("id"))
      if(!token) {
        throw new Error("Not Token Found")
      }
      forkJoin({
        deportistas: this.dservice.list(id, token),
        rutinas: this.rtservice.list(id, token)
      }).subscribe({
        next: (data) => {
          this.deportistas = data.deportistas;
          this.rutinas = data.rutinas;
        },
        error: (err) => {
          console.error("Error loading data", err);
        }
      });
      
    }catch(error:any){
      alert(error.message)
    }
  }

  filtrarDeportistas() {
    return this.deportistas.filter(d => 
      d.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
      d.apellido.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  abrirModal(deportista: Deportista) {
    const token=localStorage.getItem("token")
    if(!token) {
      throw new Error("Not Token Found")
    }
    this.mostrarModal = true;
    forkJoin({
      rutinasJugador: this.rservice.list(deportista.id, token),
    }).subscribe({
      next: (data) => {
        this.rutinasJugador = data.rutinasJugador;
        this.rutinasFiltradas = this.borrarRepetidas(this.rutinasJugador, this.rutinas, deportista.posicion.nombre);
      },
      error: (err) => {
        console.error("Error loading data", err);
      }
    });
    this.jugadorSeleccionado = deportista
  }

  asignarRutina(deportista:Deportista| null ) {
    const token=localStorage.getItem("token")
    if(!token) {
      throw new Error("Not Token Found")
    }
    const nuevaVinculacion: RutinaJugadorDTO = {
          idJugador: this.jugadorSeleccionado?.id,
          idRutina: this.rutinaSeleccionada
        };
    this.rservice.add(nuevaVinculacion, token).subscribe({
          next:(data)=>{
            alert("Rutina vinculada correctamente");
          },
          error:(err)=>{
            console.error("Error al vincular rutina", err);
          }
        })
    
  }
  verRutinas(deportista: Deportista) {
    const token=localStorage.getItem("token")
    if(!token) {
      throw new Error("Not Token Found")
    }
    forkJoin({
      rutinasJugador: this.rservice.list(deportista.id, token),
    }).subscribe({
      next: (data) => {
        this.rutinasJugador = data.rutinasJugador;
      },
      error: (err) => {
        console.error("Error loading data", err);
      }
    });
    this.jugadorSeleccionado = deportista
    this.mostrarRutinas=true
  }

  borrarRepetidas(rutinasJugador: RutinaJugador[], rutinas: Rutina[], posicion:String): Rutina[] {
    if (!rutinasJugador.length || !rutinas.length) return rutinas.filter(r=> r.posicion.nombre == posicion);
    const nombresEnComun = new Set(rutinasJugador.map(r => r.rutina?.nombre).filter(Boolean));
    const rutinasFiltradas=rutinas.filter(r => !nombresEnComun.has(r.nombre));
    return rutinasFiltradas.filter(r=> r.posicion.nombre == posicion)
  }

  verPerfil(deportista:Deportista){
    this.mostrarPerfil=true
    this.jugadorSeleccionado= deportista
  }
}
