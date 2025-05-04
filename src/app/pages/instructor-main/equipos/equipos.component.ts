import { Component, OnInit , inject} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Equipo } from '../../../models/equipo.model';
import { EquipoService } from '../../../services/equipo.service';
import { Deportista } from '../../../models/deportista.model';
import { forkJoin } from 'rxjs';
import { DeportistaService } from '../../../services/deportista.service';
import { JugadorEquipoService } from '../../../services/jugadorequipo.service';
import { JugadorEquipo } from '../../../models/jugadorEquipo.model';
import { JugadorEquipoDTO } from '../../../models/jugadorEquipoDTO.model';
import { EquipoDTO } from '../../../models/equipoDTO.model';
import { RouterModule } from '@angular/router'; 
@Component({
    selector: 'app-equipos',
    standalone:true,
    imports: [FormsModule, CommonModule, RouterModule],
    templateUrl: './equipos.component.html',
    styleUrls: [ './equipos.component.css']
})
export class EquiposComponent implements OnInit{
  private eservice= inject(EquipoService)
  private dservice= inject(DeportistaService)
  private jeservice= inject(JugadorEquipoService)
  public categorias:string[]=["Masculina","Femenina"]
  categoria : string = ""
  mostrarModalCrearEquipo = false
  deportistas:Deportista[]=[]
  equipos:Equipo[]= []
  nuevoEquipo:EquipoDTO
  instructores:any= []
  deportes:any= []
  mostrarDetallesEquipo = false
  mostrarJugadores = false
  equipoSeleccionado:Equipo|null= null
  idInstructor:number = 0
  mostrarModalAsociarJugador = false
  jugadorSeleccionado:number = 0
  jugadoresAsociados:JugadorEquipo[]=[]
  jugadoresDisponibles:Deportista[]=[]
  terminoBusqueda: string = '';
  nombreInstructor: string = '';
  fotoPerfil: string = 'assets/default-instructor.jpg';
  showUserDropdown: boolean = false;
  equiposFiltrados: Equipo[] = [];
  jugadoresFiltrados: any[] = [];
  filtroDeporte: string = '';
  busquedaJugador: string = '';
  totalEquipos: number = 0;
  equiposActivos: number = 0;
  totalJugadores: number = 0;
  equiposEnEventos: number = 0;
  mostrarModalEquipo: boolean = false;
  mostrarConfirmacionEliminar: boolean = false;
  equipoAEliminar: any = null;
  equipoEditando: boolean = false;
  formEquipo: any = {
    nombre: '',
    id_deporte: '',
    categoria: '',
    max_jugadores: 10,
    estado: 'ACTIVO',
    imagen: ''
  };
  constructor() {
    this.nuevoEquipo = {
      id: 0,
      nombre: '',
      idinstructor: 0,
      iddeporte: 0,
      maxJugadores: 0,
      fechaCreacion: new Date(),
      estado: '',
      categoria: '',
      jugadoresAsociados: 0
    };
  }
  ngOnInit(): void {
    try{
          const token=localStorage.getItem("token")
          const id = Number(localStorage.getItem("id"))
          if(!token) {
            throw new Error("Not Token Found")
          }
          forkJoin({
            deportistas: this.dservice.list(id, token),
            equipos: this.eservice.list(id, token)
           
          }).subscribe({
            next: (data) => {
              this.deportistas = data.deportistas;
              this.equipos = data.equipos;
              this.filtrarEquipos()
            },
            error: (err) => {
              console.error("Error loading data", err);
            }
          });
          
        }catch(error:any){
          alert(error.message)
        }
  }
  cargarDatosUsuario(): void {
    
  }

  cargarEquipos(): void {
    
  }

  cargarDeportes(): void {
    
  }

  cargarEstadisticas(): void {
    
  }

  actualizarEstadisticas(): void {
  }

  cargarJugadoresDisponibles(): void {
    this.cargarJugadoresAsociados();
  }

  cargarJugadoresAsociados(): void {
  }

  filtrarEquipos(): void {
    this.equiposFiltrados = this.equipos.filter(equipo => {
      const coincideBusqueda = !this.terminoBusqueda || 
        equipo.nombre.toLowerCase().includes(this.terminoBusqueda.toLowerCase());
      
      const coincideDeporte = !this.filtroDeporte || 
        equipo.deporte.id.toString() === this.filtroDeporte;
      
      return coincideBusqueda && coincideDeporte;
    });
  }

  filtrarJugadoresDisponibles(): void {
    if (!this.busquedaJugador) {
      this.jugadoresFiltrados = [...this.jugadoresDisponibles];
      return;
    }

    this.jugadoresFiltrados = this.jugadoresDisponibles.filter(jugador => 
      jugador.nombre.toLowerCase().includes(this.busquedaJugador.toLowerCase()) ||
      jugador.apellido.toLowerCase().includes(this.busquedaJugador.toLowerCase())
    );
  }

  abrirModalCrearEquipo(): void {
    this.equipoEditando = false;
    this.formEquipo = {
      nombre: '',
      id_deporte: '',
      categoria: '',
      max_jugadores: 10,
      estado: 'ACTIVO',
      imagen: ''
    };
    this.mostrarModalEquipo = true;
  }

  abrirModalEditarEquipo(equipo: any): void {
    this.equipoEditando = true;
    this.formEquipo = { ...equipo };
    this.mostrarModalEquipo = true;
  }

  cerrarModalEquipo(): void {
    this.mostrarModalEquipo = false;
  }

  guardarEquipo(): void {
    
  }


  cerrarModalAsociar(): void {
    this.mostrarModalAsociarJugador = false;
    this.equipoSeleccionado = null;
  }


  desasociarJugador(asociacionId: number): void {
    
  }


  confirmarEliminarEquipo(equipo: any): void {
    this.equipoAEliminar = equipo;
    this.mostrarConfirmacionEliminar = true;
  }

  toggleUserDropdown(): void {
    this.showUserDropdown = !this.showUserDropdown;
  }

  logout(): void {
  }

  getLogoEquipo(equipo: any): string {
    return equipo.imagen || 'assets/default-team.png';
  }
  editarEquipo(equipo:any){

  }
  eliminarEquipo(equipo:Equipo){
    const token=localStorage.getItem("token")
    if(!token) {
      throw new Error("Not Token Found")
    }
      this.eservice.delete(equipo.id, token).subscribe({
        next:(data)=>{
          this.equipos = this.equipos.filter(e => e !== equipo);
          if(data.success){
            console.log("eliminado")
          }else{
            alert("No se pudo eliminar")
          }
        },
        error:(err)=>{
          if (err.status === 0) {
            console.error('No se pudo conectar con el servidor. Por favor, verifica tu conexión a Internet.');
          } else {
            console.error('Error al eliminar la persona', err);
          }
        }
      })
    }
  verDetallesEquipo(equipo:Equipo){
    const token=localStorage.getItem("token")
    if(!token) {
      throw new Error("Not Token Found")
    }
    forkJoin({
      jugadorEquipo: this.jeservice.list(equipo.id, token),
    }).subscribe({
      next: (data) => {
        this.jugadoresAsociados = data.jugadorEquipo;
      },
      error: (err) => {
        console.error("Error loading data", err);
      }
    });
    this.mostrarDetallesEquipo = true
  }
  crearEquipo(){
    const token=localStorage.getItem("token")
        if(!token) {
          throw new Error("Not Token Found")
        }
        const nuevoEquipo: EquipoDTO = {
          nombre: this.nuevoEquipo.nombre,
          idinstructor: Number(localStorage.getItem("id")),
          iddeporte: Number(localStorage.getItem("idDeporte")),
          maxJugadores: this.nuevoEquipo.maxJugadores,
          fechaCreacion: new Date(),
          estado : "Activo",
          categoria : this.nuevoEquipo.categoria,
          jugadoresAsociados: 0
        };
        this.eservice.add(nuevoEquipo, token).subscribe({
          next:(data)=>{
            alert("Equipo agregado correctamente");
          },
          error:(err)=>{
            console.error("Error al agregar equipo", err);
          }
        })
  }
  abrirModalAsociarJugador(equipo:Equipo){
    const token=localStorage.getItem("token")
    if(!token) {
      throw new Error("Not Token Found")
    }
    forkJoin({
      jugadorEquipo: this.jeservice.list(equipo.id, token),
    }).subscribe({
      next: (data) => {
        this.jugadoresAsociados = data.jugadorEquipo;
        this.jugadoresDisponibles = this.borrarRepetidas(this.jugadoresAsociados,this.deportistas,equipo.categoria)
      },
      error: (err) => {
        console.error("Error loading data", err);
      }
    });
    this.mostrarModalAsociarJugador = true
    this.equipoSeleccionado = equipo
  }
  asociarJugador(jugador:Deportista){
    if(this.equipoSeleccionado?.jugadoresAsociados == this.equipoSeleccionado?.maxJugadores){
      console.error("Equipo lleno")
    }else{
    if (jugador.id !== null) {
      const token=localStorage.getItem("token")
          if(!token) {
            throw new Error("Not Token Found")
          }
          const nuevaVinculacion: JugadorEquipoDTO = {
                idJugador: jugador.id,
                idEquipo: this.equipoSeleccionado?.id
              };
          console.log(nuevaVinculacion.idJugador)
          this.jeservice.add(nuevaVinculacion, token).subscribe({
                next:(data)=>{
                  alert("Rutina vinculada correctamente");
                },
                error:(err)=>{
                  console.error("Error al vincular rutina", err);
                }
              })
      
      this.mostrarModalAsociarJugador = false;
    } else {
      console.error('No se ha seleccionado ningún jugador');
    }
  }
  }
  borrarRepetidas(jugadorEquipo: JugadorEquipo[], deportistas: Deportista[], genero:string): Deportista[] {
      var gen= ""
      if(genero == "Masculina"){
        gen = "Masculino"
      }else{
        gen = "Femenino"
      }
      if (!jugadorEquipo.length || !deportistas.length) return deportistas.filter(d=> d.genero== gen);
      const nombresEnComun = new Set(jugadorEquipo.map(d => d.deportista.nombre).filter(Boolean));
      const jugadoresFiltrados=deportistas.filter(r => !nombresEnComun.has(r.nombre));
      return jugadoresFiltrados.filter(r => r.genero==gen)
    }
}
