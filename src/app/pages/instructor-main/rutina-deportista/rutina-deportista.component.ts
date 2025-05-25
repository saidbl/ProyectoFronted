import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DeportistaService } from '../../../services/deportista.service';
import { CommonModule } from '@angular/common';
import { RutinaJugadorService } from '../../../services/rutinajugador.service';
import { RutinaJugador } from '../../../models/rutinajugador.model';
import { RutinaService } from '../../../services/rutina.service';
import { Rutina } from '../../../models/rutina.model';
import { RutinaJugadorDTO } from '../../../models/rutinaJugadorDTO.model';
import { forkJoin, Subject, takeUntil } from 'rxjs';
import { Router, RouterModule } from '@angular/router'; 
import { Chart, registerables } from 'chart.js';
import { PosicionService } from '../../../services/posicion.service';
import { DeportistaRendimiento } from '../../../models/deportistaRendimiento.model';
import { ObjetivoRendimiento } from '../../../models/objetivoRendimiento.model';
import { EvolucionFisicaDTO } from '../../../models/evolucionFisicaDTO.model';
import { MatIcon } from '@angular/material/icon';
import Swal from 'sweetalert2';
Chart.register(...registerables);
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-rutina-deportista',
    imports: [FormsModule, CommonModule, RouterModule,MatIcon],
    standalone: true,
    templateUrl: './rutina-deportista.component.html',
    styleUrl: './rutina-deportista.component.css'
})
export class RutinaDeportistaComponent implements OnInit,AfterViewInit{
  private dservice= inject(DeportistaService)
  private rservice = inject(RutinaJugadorService)
  private rtservice = inject(RutinaService)
  private pservice = inject(PosicionService)
  private destroy$ = new Subject<void>();
  private cdRef = inject(ChangeDetectorRef);
  @ViewChild('rutinasChart') private chartRef!: ElementRef;
  deportistas: DeportistaRendimiento[] = [];
  rutinasF : Rutina[]=[]
  rutinasJugador: RutinaJugador[] = [];
  rutinas: Rutina[] = []
  jugadorSeleccionado: DeportistaRendimiento|null = null;
  rutinaSeleccionada!: number;
  mostrarModal = false;
  datos : EvolucionFisicaDTO[]|undefined = []
  rutinasFiltradas : Rutina[]=[]
  mostrarRutinas = false;
  mostrarPerfil = false;
  datosC: any = { 
  porcentajeCompletadas: 0, 
  completadas: 0, 
  incompletas: 0 
  
};
contadorProgresos: number = 0;
  searchTerm = '';
  chart2!: Chart;
  filtroPosicion: string = '';
  filtroEstadoFisico: string = '';
  filtroUltimaActividad: string = '';
  mostrarModalAsignar: boolean = false;
  mostrarModalPerfil: boolean = false;
  mostrarModalRutinas: boolean = false;
  deportistasFiltrados: DeportistaRendimiento[] = [];
  mostrarFiltros: boolean = false;
  cargando: boolean = true;
  posiciones: any[] = [];
  busquedaRutina: string = '';
  filtroTipoRutina: string = '';
  tiposRutina = [
    {value: 'FUERZA', nombre: 'Fuerza', icono: 'fas fa-dumbbell'},
    {value: 'RESISTENCIA', nombre: 'Resistencia', icono: 'fas fa-running'},
    {value: 'VELOCIDAD', nombre: 'Velocidad', icono: 'fas fa-bolt'},
    {value: 'FLEXIBILIDAD', nombre: 'Flexibilidad', icono: 'fas fa-spa'},
    {value: 'TECNICA', nombre: 'Técnica', icono: 'fas fa-football-ball'}
  ];
  checkinsJugador: any[] = [];
  constructor(public router: Router) {}
  nombre: string = '';
  apellido: string = '';
  metricasRendimiento: any[] = [];
  objetivosJugador: any[] = [];
  evolucionChart: any;
  medicionesJugador: any[] = [];
  totalJugadores: number = 0;
  totalRutinasActivas: number = 0;
   showUserDropdown: boolean = false;
   fotoPerfil: string = "http://localhost:8080/";
  progresoPromedio: number = 0;
  jugadoresDestacados: number = 0;
  private chart: Chart | undefined = undefined;
  navigation = [
  { name: 'Eventos', route: 'equipoEvento', icon: 'event' },
  { name: 'Deportistas', route: 'rutinaDeportista', icon: 'people' },
  { name: 'Equipos', route: 'crearEquipos', icon: 'groups' },
  { name: 'Rutinas', route: 'rutinas', icon: 'fitness_center' },
  { name: 'Reportes', route: 'reportes', icon: 'analytics' }
];
userAvatar:string= ""



  ngOnInit() {
    try{
      const fotoPerfil = localStorage.getItem("fotoPerfil")
      const nom=localStorage.getItem("nombre")
      const ap = localStorage.getItem("apellido")
      const token=localStorage.getItem("token")
      const id = Number(localStorage.getItem("id"))
      const deporte = Number(localStorage.getItem("idDeporte"))
      if(!token) {
        this.showAuthError();
        throw new Error("Not Token Found")
      }
      forkJoin({
        deportistas: this.dservice.listCheckRenObj(id,token).pipe(
        takeUntil(this.destroy$)),
        rutinas: this.rtservice.list(id, token),
        posiciones: this.pservice.list(deporte,token)

        
      }).subscribe({
        next: (data) => {
          this.deportistas=data.deportistas
          console.log(data.deportistas)
          this.rutinas = data.rutinas;
          this.totalJugadores = this.deportistas.length
          this.totalRutinasActivas = this.rutinas.length
          this.posiciones= data.posiciones
          this.deportistasFiltrados = this.deportistas
          this.renderizarGrafico()
          this.renderizarGrafico2();
          console.log(this.deportistas)
          this.cdRef.markForCheck();
          this.fotoPerfil = this.fotoPerfil+ fotoPerfil
          console.log(this.fotoPerfil)
          this.nombre=nom ?? ''
          this.apellido= ap ?? ''
          
        },
        error: (err) => {
          console.error("Error loading data", err);
          Swal.fire('Error', err.message, 'error');

        }
      });
      
    }catch(error:any){
      alert(error.message)
    }
  }
  ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}

  ngAfterViewInit() {
  this.renderizarGrafico();
  this.renderizarGrafico2();
}
cerrarSesion(){
  
}
  filtrarDeportistas() {
    this.deportistasFiltrados = this.deportistas.filter(d => {
      const matchesSearch = !this.searchTerm || 
        `${d.deportista.nombre} ${d.deportista.apellido}`.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        d.deportista.posicion.nombre.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesPosicion = !this.filtroPosicion || d.deportista.posicion.nombre == this.filtroPosicion;
      return matchesSearch && matchesPosicion;
    });
  }

   calcularEdad(fechaNacimiento: Date|undefined): number {
    if (!fechaNacimiento) {
    return 0; 
  }
  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const m = hoy.getMonth() - nacimiento.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }
  return edad;
}
toggleUserDropdown() {
    this.showUserDropdown =  !this.showUserDropdown;
  }
    calcularProgreso(objetivosTotales: ObjetivoRendimiento[], objetivosIncompletos: ObjetivoRendimiento[], totalRutinas: number, rutinasCompletadas: number): number {
        const totalObjetivos = objetivosTotales.length ;
  const objetivosCompletos = totalObjetivos - (objetivosIncompletos?.length || 0);
  console.log(totalObjetivos)
  console.log(objetivosCompletos)
  const totalTareas = totalRutinas + totalObjetivos;
  if (totalTareas === 0) {
    return 0; 
  }
  return Math.round(((objetivosCompletos+rutinasCompletadas)/(totalRutinas+totalObjetivos))*100);
    }
    getProgresoPromedioFinal(): number {
       if (!this.deportistasFiltrados?.length) return 0;
  
        return this.deportistasFiltrados.reduce((acc, dep) => {
          return acc + this.calcularProgreso(
            dep.objetivosTotales,
            dep.objetivosIncompletos,
            dep.totalRutinas,
            dep.rutinasCompletadas
          );
          }, 0) / this.deportistasFiltrados.length;
}
   normalizarProgreso(progreso: number): number {
    return Math.min(Math.max(progreso || 0, 0), 100);
  }
 abrirModalRutinas(deportista: DeportistaRendimiento) {
  this.jugadorSeleccionado = deportista;
     const token=localStorage.getItem("token")
    if(!token) {
      throw new Error("Not Token Found")
    }
    forkJoin({
      rutinasJugador: this.rservice.list(deportista.deportista.id, token),
    }).subscribe({
      next: (data) => {
        this.rutinasJugador = data.rutinasJugador;
        this.mostrarModalRutinas = true; 
        this.cdRef.markForCheck();
      },
      error: (err) => {
        console.error("Error loading data", err);
      }
    });
  }
  async exportarDatos() {
  }
   aplicarFiltros() {
    this.filtrarDeportistas();
    this.mostrarFiltros = false;
  }
  abrirModalPerfil(deportistaR: DeportistaRendimiento) {
  this.jugadorSeleccionado = deportistaR;
      this.datosC = { 
        porcentajeCompletadas: (deportistaR.rutinasCompletadas/deportistaR.totalRutinas)*100, 
        completadas: deportistaR.rutinasCompletadas, 
        incompletas: deportistaR.totalRutinas - deportistaR.rutinasCompletadas
      }
   setTimeout(() => this.renderizarGrafico(), 0);
    setTimeout(() => this.renderizarGrafico2(), 0);
  this.mostrarModalPerfil = true;
}

  limpiarFiltros() {
    this.searchTerm = '';
    this.filtroPosicion = '';
    this.filtrarDeportistas();
    this.mostrarFiltros = false;
  }
  trackByDeportista(index: number, dep: any): number {
  return dep.deportista.id;
}

trackByRutina(index: number, rutina: any): number {
  return rutina.id;
}
getMetrica(metricas: EvolucionFisicaDTO[]|undefined, tipo: string): number{
  console.log(metricas)
     if (!metricas || metricas.length < 2) {
    return 0;
  }


  if (tipo === "peso") {
    const actual = metricas[metricas.length - 1].peso

    return actual;
  }else if(tipo === "imc"){
    const actual = metricas[metricas.length - 1].imc


    return actual;

  }else if(tipo === "porcentaje_grasa"){
    const actual = metricas[metricas.length - 1].porcentajeGrasa

    return actual;
  }
  return 0
}
  
    getTrend(metricas: EvolucionFisicaDTO[]|undefined, tipo: string): number {
      console.log(metricas)
     if (!metricas || metricas.length < 2) {
    return 0;
  }


  if (tipo === "peso") {
    const actual = metricas[metricas.length - 1].peso
    const anterior = metricas[metricas.length - 2].peso;

    if (anterior === 0) return 0; 

    return Math.round(actual / anterior);
  }else if(tipo === "imc"){
    const actual = metricas[metricas.length - 1].imc
    const anterior = metricas[metricas.length - 2].imc;

    if (anterior === 0) return 0; 

    return Math.round(actual / anterior);

  }else if(tipo === "porcentaje_grasa"){
    const actual = metricas[metricas.length - 1].porcentajeGrasa
    const anterior = metricas[metricas.length - 2].porcentajeGrasa;

    if (anterior === 0) return 0; 

    return Math.round(actual / anterior);
  }
  return 0
  }
  renderizarGrafico() {
  const ctx = document.getElementById('evolucionChart') as HTMLCanvasElement;

  if (this.chart) {
    this.chart.destroy();
  }
  console.log("hola")
  this.datos = this.jugadorSeleccionado?.evolucionFisica;
  const datosFiltrados = this.datos?.filter(
    d => d.peso !== undefined && d.imc !== undefined && d.masaMuscular !== undefined
  ) ?? [];
  if (!ctx) {
  console.error('No se encontró el canvas con id "evolucionChart".');
  return;
}

  this.chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: datosFiltrados.map(d => new Date(d.fecha).toLocaleDateString()),
      datasets: [
        {
          label: 'Peso (kg)',
          data: datosFiltrados.map(d => d.peso ?? 0),
          borderColor: '#3e95cd',
          backgroundColor: 'rgba(62, 149, 205, 0.1)',
          borderWidth: 2,
          tension: 0.3,
          yAxisID: 'y'
        },
        {
          label: 'IMC',
          data: datosFiltrados.map(d => d.imc ?? 0),
          borderColor: '#8e5ea2',
          backgroundColor: 'rgba(142, 94, 162, 0.1)',
          borderWidth: 2,
          tension: 0.3,
          yAxisID: 'y1'
        },
        {
          label: 'Masa Muscular (kg)',
          data: datosFiltrados.map(d => d.masaMuscular ?? 0),
          borderColor: '#3cba9f',
          backgroundColor: 'rgba(60, 186, 159, 0.1)',
          borderWidth: 2,
          tension: 0.3,
          yAxisID: 'y'
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Evolución Física',
          font: { size: 16 }
        },
        tooltip: {
          mode: 'index',
          intersect: false
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Fecha'
          }
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: 'Peso y Masa Muscular (kg)'
          }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: 'IMC'
          },
          grid: {
            drawOnChartArea: false
          }
        }
      },
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
      }
    }
  });
}
  renderizarGrafico2() {
  if (!this.chartRef?.nativeElement) return;

  if (this.chart2) {
    this.chart2.destroy();
  }

  const ctx = this.chartRef.nativeElement.getContext('2d');
  const data = {
    completadas: this.datosC?.completadas || 0,
    incompletas: this.datosC?.incompletas || 0,
    porcentaje: this.datosC?.porcentajeCompletadas || 0
  };

  this.chart2 = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Completadas', 'Incompletas'],
      datasets: [{
        data: [data.completadas, data.incompletas],
        backgroundColor: ['#4CAF50', '#F44336'],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'top' },
        title: {
          display: true,
          text: `Cumplimiento: ${data.porcentaje}%`,
          font: { size: 16 }
        }
      },
      cutout: '70%'
    }
  });
}

    verDetalleRutina(rutina: any) {
    this.cerrarModal();
  }
  async quitarRutina(rutinaJugador: RutinaJugador) {
        const token = localStorage.getItem("token");
        if (!token) {
            this.showAuthError();
            return;
        }

        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "Esta acción no se puede deshacer",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar!'
        });

        if (result.isConfirmed) {
            this.rservice.delete(rutinaJugador.id, token).subscribe({
                next: (data) => {
                    if (data.success) {
                        Swal.fire('¡Eliminado!', 'La rutina fue desvinculada', 'success');
                        this.abrirModalAsignar(this.jugadorSeleccionado);
                    } else {
                        Swal.fire('Error', 'No se pudo eliminar la rutina', 'error');
                    }
                },
                error: (err) => {
                    console.error(err);
                    Swal.fire('Error', 'Ocurrió un error al procesar la solicitud', 'error');
                }
            });
        }
    }

  asignarRutina(deportista: DeportistaRendimiento | null) {
        const token = localStorage.getItem("token");
        if (!token) {
            this.showAuthError();
            return;
        }

        if (!this.rutinaSeleccionada) {
            Swal.fire('Advertencia', 'Debes seleccionar una rutina primero', 'warning');
            return;
        }

        const nuevaVinculacion: RutinaJugadorDTO = {
            idJugador: this.jugadorSeleccionado?.deportista?.id,
            idRutina: this.rutinaSeleccionada
        };

        this.rservice.add(nuevaVinculacion, token).subscribe({
            next: (data) => {
                Swal.fire('¡Éxito!', 'Rutina vinculada correctamente', 'success');
                this.abrirModalAsignar(this.jugadorSeleccionado);
            },
            error: (err) => {
                console.error("Error al vincular rutina", err);
                Swal.fire('Error', 'No se pudo vincular la rutina', 'error');
            }
        });
    }
    getMensajeRiesgo(): string | null {
  const evolucion = this.jugadorSeleccionado?.evolucionFisica;
  const sexo = this.jugadorSeleccionado?.deportista?.genero.toLowerCase();
  if (!evolucion || evolucion.length === 0 || !sexo) return null;

  const ultima = evolucion[evolucion.length - 1];
  const { imc, peso, porcentajeGrasa } = ultima;

  let mensaje = '';

  // Clasificación IMC
  if (imc < 18.5) {
    mensaje += '⚠ Bajo peso (IMC < 18.5). Riesgo de fatiga, lesiones musculares o fracturas. ';
  } else if (imc >= 18.5 && imc < 24.9) {
    mensaje += '✅ IMC dentro del rango saludable. ';
  } else if (imc >= 25 && imc < 29.9) {
    mensaje += '⚠ Sobrepeso (IMC entre 25 y 29.9). Riesgo de menor rendimiento físico. ';
  } else {
    mensaje += '❗ Obesidad (IMC ≥ 30). Riesgo alto de lesión, fatiga y enfermedades crónicas. ';
  }
  if (sexo === 'masculino') {
    if (porcentajeGrasa < 8) {
      mensaje += '⚠ Grasa corporal muy baja. Posible pérdida de masa muscular. ';
    } else if (porcentajeGrasa > 25) {
      mensaje += '❗ Grasa corporal alta. Riesgo cardiovascular y menor agilidad. ';
    }
  } else if (sexo === 'femenino') {
    if (porcentajeGrasa < 18) {
      mensaje += '⚠ Grasa corporal muy baja. Riesgo hormonal y de fatiga. ';
    } else if (porcentajeGrasa > 32) {
      mensaje += '❗ Grasa corporal alta. Riesgo de lesiones y menor rendimiento. ';
    }
  }
  if (peso < 50) {
    mensaje += '⚠ Peso bajo. Revisar nutrición y masa muscular.';
  } else if (peso > 100) {
    mensaje += '⚠ Peso elevado. Posible sobrecarga articular. ';
  }

  return mensaje || '✅ Estado físico saludable.';
}


    abrirModalAsignar(deportista: DeportistaRendimiento|null) {
    const token=localStorage.getItem("token")
    if(!token) {
      this.showAuthError();
      throw new Error("Not Token Found")
    }
    this.mostrarModal = true;
    forkJoin({
      rutinasJugador: this.rservice.list(deportista?.deportista?.id??0, token),
    }).subscribe({
      next: (data) => {
        this.rutinasJugador = data.rutinasJugador;
        this.rutinasF =this.borrarRepetidas(this.rutinasJugador, this.rutinas, deportista?.deportista?.posicion?.nombre??"");
        this.rutinasFiltradas = this.borrarRepetidas(this.rutinasJugador, this.rutinas, deportista?.deportista?.posicion?.nombre??"");
        this.mostrarModalAsignar = true;
        this.filtrarRutinas();
        this.cdRef.markForCheck();
        if (this.rutinasFiltradas.length === 0) {
                    Swal.fire('Info', 'No hay rutinas disponibles para asignar', 'info');
                }
      },
      error: (err) => {
        console.error("Error loading data", err);
        Swal.fire('Error', 'No se pudieron cargar las rutinas', 'error');
      }
    });
    this.jugadorSeleccionado = deportista;
    this.busquedaRutina = '';
    this.filtroTipoRutina = '';
  }
  private showAuthError() {
        Swal.fire({
            icon: 'error',
            title: 'Error de autenticación',
            text: 'Tu sesión ha expirado o no estás autenticado',
            confirmButtonText: 'Entendido',
            allowOutsideClick: false
        }).then(() => {
        });
    }
   filtrarRutinas() {
    this.rutinasFiltradas = this.rutinasF.filter(r => {
      const matchesSearch = !this.busquedaRutina || 
        r.nombre.toLowerCase().includes(this.busquedaRutina.toLowerCase());
      const matchesType = !this.filtroTipoRutina || r.objetivo === this.filtroTipoRutina;
      return matchesSearch && matchesType;
    });
  }
    filtrarRutinasPorTipo(tipo: string) {
    this.filtroTipoRutina = tipo;
    this.filtrarRutinas();
  }
   seleccionarRutina(rutina: Rutina) {
    this.rutinaSeleccionada = rutina.id;
  }
    obtenerIconoRutina(objetivo: string): string {
    switch(objetivo) {
      case 'FUERZA': return 'fas fa-dumbbell text-blue-400';
      case 'RESISTENCIA': return 'fas fa-running text-green-400';
      case 'VELOCIDAD': return 'fas fa-bolt text-yellow-400';
      case 'FLEXIBILIDAD': return 'fas fa-spa text-purple-400';
      case 'TECNICA': return 'fas fa-football-ball text-red-400';
      default: return 'fas fa-dumbbell text-gray-400';
    }
  }
  cerrarModal() {
    this.mostrarModalAsignar = false;
    this.mostrarModalPerfil = false;
    this.mostrarModalRutinas = false;
    this.jugadorSeleccionado = null;
    this.rutinaSeleccionada = 0
    
    if (this.evolucionChart) {
      this.evolucionChart.destroy();
      this.evolucionChart = null;
    }
  }
  borrarRepetidas(rutinasJugador: RutinaJugador[], rutinas: Rutina[], posicion:String): Rutina[] {
    if (!rutinasJugador.length || !rutinas.length) return rutinas.filter(r=> r.posicion.nombre == posicion);
    const nombresEnComun = new Set(rutinasJugador.map(r => r.rutina?.nombre).filter(Boolean));
    const rutinasFiltradas=rutinas.filter(r => !nombresEnComun.has(r.nombre));
    return rutinasFiltradas.filter(r=> r.posicion.nombre == posicion)
  }

  verPerfil(deportista:DeportistaRendimiento){
    this.mostrarPerfil=true
    this.jugadorSeleccionado= deportista
  }
}
