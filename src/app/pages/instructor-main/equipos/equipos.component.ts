import { Component, OnInit , inject} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Equipo } from '../../../models/equipo.model';
import { EquipoService } from '../../../services/equipo.service';
import { Deportista } from '../../../models/deportista.model';
import { forkJoin, Subject, takeUntil } from 'rxjs';
import { DeportistaService } from '../../../services/deportista.service';
import { JugadorEquipoService } from '../../../services/jugadorequipo.service';
import { JugadorEquipo } from '../../../models/jugadorEquipo.model';
import { JugadorEquipoDTO } from '../../../models/jugadorEquipoDTO.model';
import { EquipoDTO } from '../../../models/equipoDTO.model';
import { Router, RouterModule } from '@angular/router'; 
import Swal from 'sweetalert2';
import { MatIconModule } from '@angular/material/icon';
import { InstructorService } from '../../../services/instructor.service';
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
  private iservice = inject(InstructorService)
  cargando: boolean = false;
  public categorias:string[]=["Masculina","Femenina"]
  categoria : string = ""
  mostrarModalCrearEquipo = false
  deportistas:Deportista[]=[]
  fotoPerfil: string = "http://localhost:8080/";
  equipos:Equipo[]= []
  nuevoEquipo:EquipoDTO
  instructores:any= []
  deportes:any= []
  apellido = ""
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
  nombre: string = '';
  navigation = [
  { name: 'Eventos', route: '../equipoEvento', icon: 'event' },
  { name: 'Deportistas', route: '../rutinaDeportista', icon: 'people' },
  { name: 'Equipos', route: '../crearEquipos', icon: 'groups' },
  { name: 'Rutinas', route: '../rutinas', icon: 'fitness_center' },
  { name: 'Reportes', route: '../reportes', icon: 'analytics' }
];
  imagenPreview: string | ArrayBuffer | null = null;
  formEquipo: any = {
    nombre: '',
    id_deporte: 0,
    categoria: '',
    max_jugadores: 0,
    estado: 'ACTIVO',
    imagen:null
  };
  constructor(public router: Router) {
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
  private destroy$ = new Subject<void>(); 
  ngOnInit(): void {
    this.cargarDatosIniciales();
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  private cargarDatosIniciales(){
    try{
      const nom=localStorage.getItem("nombre")
      const fotoPerfil = localStorage.getItem("fotoPerfil")
          const token=localStorage.getItem("token")
          const id = Number(localStorage.getItem("id"))
          const ap = localStorage.getItem("apellido")
          if(!token) {
            throw new Error("Not Token Found")
          }
          forkJoin({
            deportistas: this.dservice.list(id, token),
            equipos: this.eservice.list(id, token)
           
          }).pipe(takeUntil(this.destroy$)).subscribe({
            next: (data) => {
              this.deportistas = data.deportistas;
              this.equipos = data.equipos;
              this.totalEquipos = data.equipos.length
              this.nombre=nom ?? ''
              this.fotoPerfil = this.fotoPerfil+ fotoPerfil
              this.apellido= ap ?? ''
              this.filtrarEquipos()
               this.calcularEstadisticas();
            },
            error: (err) => {
              console.error("Error loading data", err);
              this.mostrarErrorSweetAlert('Error', 'No se pudieron cargar los datos iniciales');
            }
          });
          
        }catch(error:any){
          this.mostrarErrorSweetAlert('Error', error.message);
        }
  }

  onImageSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
  if (!file?.type.startsWith('image/')) {
    this.mostrarErrorSweetAlert('Archivo inválido', 'Solo se permiten imágenes');
    return;
  }
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
cerrarSesion() {
 Swal.fire({
  title: '¿Estás seguro?',
  text: '¿Quieres cerrar sesión?',
  icon: 'warning',
  showCancelButton: true,
  confirmButtonText: 'Sí, cerrar sesión',
  cancelButtonText: 'Cancelar'
}).then((result) => {
  if (result.isConfirmed) {
    this.iservice.logOut();
    this.router.navigate(['/login']);
    Swal.fire('Sesión cerrada', '', 'success');
  }
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
      id_deporte: Number(localStorage.getItem("idDeporte")),
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
    this.cargando = true;
    if (this.equipoEditando) {
      this.editarEquipo(nuevoEquipo, token);
      this.actualizarListaEquipos();
      this.mostrarModalEquipo = false;
        this.actualizarListaEquipos();
    } else {
      this.crearEquipo(nuevoEquipo, token);
      this.actualizarListaEquipos();
      this.mostrarModalEquipo = false;
        this.actualizarListaEquipos();
    }
  }
  private actualizarListaEquipos(): void {
    this.cargando = true;
  const token = localStorage.getItem("token");
  const id = Number(localStorage.getItem("id"));
  
  this.eservice.list(id, token || '').pipe(takeUntil(this.destroy$)).subscribe({
    next: (equiposActualizados) => {
      this.equipos = equiposActualizados;
      this.filtrarEquipos();
      this.calcularEstadisticas(); 
      this.cargando = false;
    },
      error: (err) => {
        this.cargando = false;
        console.error("Error updating teams list", err);
        this.mostrarErrorSweetAlert('Error', 'No se pudo actualizar la lista de equipos');
      }
  });
}
private calcularEstadisticas(): void {
  this.totalEquipos = this.equipos.length;
  this.equiposActivos = this.equipos.filter(e => e.estado === 'ACTIVO').length;
  this.totalJugadores = this.equipos.reduce((sum, e) => sum + e.jugadoresAsociados, 0);
}

  crearEquipo(equipoDTO: EquipoDTO, token: string): void {
    this.eservice.add(equipoDTO, token, this.formEquipo.imagen).subscribe({
      next: (data) => {
        this.mostrarExitoSweetAlert('Equipo creado', 'El equipo se ha creado correctamente');
        this.mostrarModalEquipo = false;
        this.actualizarListaEquipos()
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
        this.actualizarListaEquipos()
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
        this.cargando = true;
        const token = localStorage.getItem("token");
        if(!token) {
          throw new Error("Not Token Found")
    }
        this.jeservice.delete(asociacionId, token).pipe(takeUntil(this.destroy$)).subscribe({
          next: (data) => {
            this.cargando = false;
            this.mostrarExitoSweetAlert('Jugador desasociado', 'El jugador se ha desasociado del equipo');
            if (this.equipoSeleccionado) {
              this.verDetallesEquipo(this.equipoSeleccionado);
            }
            this.actualizarListaEquipos(); 
          },
          error: (err) => {
            this.cargando = false;
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
     this.cargando = true;
      this.eservice.delete(equipo.id, token).pipe(takeUntil(this.destroy$)).subscribe({
        next:(data)=>{

          this.equipos = this.equipos.filter(e => e !== equipo);
          if(data.success){
            this.cargando = false;
            this.mostrarExitoSweetAlert('Equipo eliminado', 'El equipo se ha eliminado correctamente');
            this.actualizarListaEquipos();
          }else{
            alert("No se pudo eliminar")
          }
        },
        error:(err)=>{
           this.cargando = false;
            if (err.status === 0) {
              this.mostrarErrorSweetAlert('Error de conexión', 'No se pudo conectar con el servidor');
            } else {
              this.mostrarErrorSweetAlert('Error', 'No se pudo eliminar el equipo');
            }
        }
      })
    }
  
  validarFormularioEquipo(): boolean {
    console.log(this.formEquipo.nombre)
    console.log(this.formEquipo.categoria)
    console.log(this.formEquipo.id_deporte)
    console.log(this.formEquipo.max_jugadores)
   if (!this.formEquipo.nombre || !this.formEquipo.categoria || 
        !this.formEquipo.max_jugadores || !this.formEquipo.id_deporte) {
      this.mostrarAdvertenciaSweetAlert('Campos requeridos', 'Por favor, complete todos los campos obligatorios');
      return false;
    }
    if (this.formEquipo.max_jugadores <= 0) {
      this.mostrarAdvertenciaSweetAlert('Límite inválido', 'El límite de jugadores debe ser mayor a 0');
      return false;
    }
    const nombreExistente = this.equipos.some(e =>
      e.nombre.toLowerCase() === this.formEquipo.nombre.toLowerCase() &&
      (!this.equipoEditando || e.id !== this.formEquipo.id)
    );
    
    if (nombreExistente) {
      this.mostrarAdvertenciaSweetAlert('Nombre duplicado', 'Ya existe un equipo con ese nombre');
      return false;
    }
    if (this.equipoEditando && this.equipoSeleccionado) {
      if (this.formEquipo.max_jugadores < this.equipoSeleccionado.jugadoresAsociados) {
        this.mostrarAdvertenciaSweetAlert('Límite inválido', 'El límite no puede ser menor a los jugadores actuales');
        return false;
      }
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
        this.jugadoresFiltrados = this.jugadoresDisponibles
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
    this.cargando = true;
    if (!this.equipoSeleccionado) {
      this.cargando = false;
      return;
    }

    if (this.equipoSeleccionado.jugadoresAsociados >= this.equipoSeleccionado.maxJugadores) {
      this.cargando = false;
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
          this.jeservice.add(nuevaVinculacion, token).pipe(takeUntil(this.destroy$)).subscribe({
                next:(data)=>{
                  this.cargando = false;
                  this.mostrarExitoSweetAlert('Jugador asociado', 'El jugador se ha asociado correctamente al equipo');
                  this.mostrarModalAsociarJugador = false;
                  if (this.equipoSeleccionado) {
          this.verDetallesEquipo(this.equipoSeleccionado);
        }
        this.actualizarListaEquipos();
                },
                error:(err)=>{
                  this.cargando = false;
        console.error("Error al vincular jugador", err);
        
        if (err.status === 409) {
          this.mostrarErrorSweetAlert('Error', 'El jugador ya está asociado a este equipo');
        } else {
          this.mostrarErrorSweetAlert('Error', 'No se pudo asociar el jugador al equipo');
        }
                }
              })
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
