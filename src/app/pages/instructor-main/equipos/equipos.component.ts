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
import Swal from 'sweetalert2';
import { MatIconModule } from '@angular/material/icon';
@Component({
    selector: 'app-equipos',
    standalone:true,
    imports: [FormsModule, CommonModule, RouterModule,MatIconModule],
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
  imagenCambiada: boolean = false;
  imagenPreview: string | ArrayBuffer | null = null;
  formEquipo: any = {
    nombre: '',
    id_deporte: '',
    categoria: '',
    max_jugadores: 0,
    estado: 'ACTIVO',
    imagen:null
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
              this.mostrarErrorSweetAlert('Error', 'No se pudieron cargar los datos iniciales');
            }
          });
          
        }catch(error:any){
          alert(error.message)
        }
  }

  onImageSelected(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files[0]) {
      const file = fileInput.files[0];
      this.formEquipo.imagen = file; 
      const reader = new FileReader();
      reader.onload = () => {
        this.imagenPreview = reader.result; 
      };
      reader.readAsDataURL(file);
    }
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
      max_jugadores: 0,
      estado: 'ACTIVO',
      imagen: ''
    };
    this.imagenPreview = null;
    this.imagenCambiada = false;
    this.mostrarModalEquipo = true;
  }

  abrirModalEditarEquipo(equipo: Equipo): void {
    this.equipoEditando = true;
    this.formEquipo = { 
      id: equipo.id,
      nombre: equipo.nombre,
      id_deporte: equipo.deporte.id.toString(),
      categoria: equipo.categoria,
      max_jugadores: equipo.maxJugadores,
      estado: equipo.estado,
    };
    console.log(equipo.id)
    console.log(equipo.img)
    this.imagenPreview = this.getLogoEquipo(equipo);
    this.mostrarModalEquipo = true;
  }

  cerrarModalEquipo(): void {
    this.mostrarModalEquipo = false;
  }

  guardarEquipo(): void {
    if (!this.validarFormularioEquipo()) return;
    const token=localStorage.getItem("token")
    if(!token) {
          throw new Error("Not Token Found")
    }
    const nuevoEquipo: EquipoDTO = {
      id: this.formEquipo.id,
      nombre: this.formEquipo.nombre,
      idinstructor: Number(localStorage.getItem("id")),
      iddeporte: Number(localStorage.getItem("idDeporte")),
      maxJugadores: this.formEquipo.max_jugadores,
      fechaCreacion: new Date(),
      estado : "Activo",
      categoria : this.formEquipo.categoria,
      jugadoresAsociados: 0
    };
    if (this.equipoEditando) {
      this.editarEquipo(nuevoEquipo, token);
    } else {
      this.crearEquipo(nuevoEquipo, token);
    }
  }

  crearEquipo(equipoDTO: EquipoDTO, token: string): void {
    this.eservice.add(equipoDTO, token, this.formEquipo.imagen).subscribe({
      next: (data) => {
        this.mostrarExitoSweetAlert('Equipo creado', 'El equipo se ha creado correctamente');
        this.mostrarModalEquipo = false;
      },
      error: (err) => {
        console.error(err);
        this.mostrarErrorSweetAlert('Error', 'No se pudo crear el equipo');
      }
    });
  }
  editarEquipo(equipoDTO: EquipoDTO, token: string){
     this.eservice.update(
      equipoDTO, 
      token, 
       this.formEquipo.imagen 
    ).subscribe({
      next: (data) => {
        this.mostrarExitoSweetAlert('Equipo actualizado', 'El equipo se ha actualizado correctamente');
        this.mostrarModalEquipo = false;
      },
      error: (err) => {
        console.error(err);
        this.mostrarErrorSweetAlert('Error', 'No se pudo actualizar el equipo');
      }
    });
  }



  cerrarModalAsociar(): void {
    this.mostrarModalAsociarJugador = false;
    this.equipoSeleccionado = null;
  }


  desasociarJugador(asociacionId: number): void {
    Swal.fire({
      title: '¿Desasociar jugador?',
      text: '¿Estás seguro de desasociar este jugador del equipo?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, desasociar',
      cancelButtonText: 'Cancelar',
      background: '#1f2937',
      color: '#fff',
      iconColor: '#3b82f6'
    }).then((result) => {
      if (result.isConfirmed) {
        const token = localStorage.getItem("token");
        if(!token) {
          throw new Error("Not Token Found")
    }
        this.jeservice.delete(asociacionId, token).subscribe({
          next: (data) => {
            this.mostrarExitoSweetAlert('Jugador desasociado', 'El jugador se ha desasociado del equipo');
            if (this.equipoSeleccionado) {
              this.verDetallesEquipo(this.equipoSeleccionado);
            }
          },
          error: (err) => {
            console.error(err);
            this.mostrarErrorSweetAlert('Error', 'No se pudo desasociar el jugador');
          }
        });
      }
    });
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

  getLogoEquipo(equipo: Equipo): string {
    return 'http://localhost:8080/'+equipo.img || 'assets/default-team.png';
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
            this.mostrarExitoSweetAlert('Equipo eliminado', 'El equipo se ha eliminado correctamente');
          }else{
            alert("No se pudo eliminar")
          }
        },
        error:(err)=>{
          if (err.status === 0) {
            this.mostrarErrorSweetAlert('Error de conexión', 'No se pudo conectar con el servidor. Verifica tu conexión a Internet.');
          } else {
             this.mostrarErrorSweetAlert('Error', 'No se pudo eliminar el equipo');
          }
        }
      })
    }
  
  validarFormularioEquipo(): boolean {
    if (!this.formEquipo.nombre || !this.formEquipo.categoria || !this.formEquipo.max_jugadores) {
      this.mostrarAdvertenciaSweetAlert('Campos requeridos', 'Debes completar todos los campos obligatorios');
      return false;
    }

    if (this.formEquipo.max_jugadores < 1) {
      this.mostrarAdvertenciaSweetAlert('Valor inválido', 'El número máximo de jugadores debe ser al menos 1');
      return false;
    }

    return true;
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
        this.mostrarErrorSweetAlert('Error', 'No se pudieron cargar los jugadores del equipo');
      }
    });
    this.mostrarDetallesEquipo = true
    this.equipoSeleccionado=equipo
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
        this.mostrarErrorSweetAlert('Error', 'No se pudieron cargar los jugadores disponibles');
      }
    });
    this.mostrarModalAsociarJugador = true
    this.equipoSeleccionado = equipo
  }
  asociarJugador(jugador:Deportista){
    if (!this.equipoSeleccionado) return;

    if (this.equipoSeleccionado.jugadoresAsociados >= this.equipoSeleccionado.maxJugadores) {
      this.mostrarAdvertenciaSweetAlert('Equipo completo', 'Este equipo ya alcanzó el máximo de jugadores permitidos');
      return;
    }
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
                  this.mostrarExitoSweetAlert('Jugador asociado', 'El jugador se ha asociado correctamente al equipo');
                  this.mostrarModalAsociarJugador = false;
                },
                error:(err)=>{
                  console.error("Error al vincular jugador", err);
                  this.mostrarErrorSweetAlert('Error', 'No se pudo asociar el jugador al equipo');
                }
              })
      
      this.mostrarModalAsociarJugador = false;
    } else {
      console.error('No se ha seleccionado ningún jugador');
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
      mostrarExitoSweetAlert(titulo: string, mensaje: string): void {
    Swal.fire({
      title: titulo,
      text: mensaje,
      icon: 'success',
      confirmButtonColor: '#10b981',
      background: '#1f2937',
      color: '#fff',
      iconColor: '#10b981',
      timer: 3000,
      timerProgressBar: true
    });
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

  mostrarAdvertenciaSweetAlert(titulo: string, mensaje: string): void {
    Swal.fire({
      title: titulo,
      text: mensaje,
      icon: 'warning',
      confirmButtonColor: '#f59e0b',
      background: '#1f2937',
      color: '#fff',
      iconColor: '#f59e0b'
    });
  }
}
