import { AfterViewInit, Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
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
import { Chart, registerables } from 'chart.js';
import { PosicionService } from '../../../services/posicion.service';
import { DeportistaRendimiento } from '../../../models/deportistaRendimiento.model';
import { ObjetivoRendimientoService } from '../../../services/objetivoRendimiento.service';
import { ObjetivoRendimiento } from '../../../models/objetivoRendimiento.model';
import { RegistroRendimiento } from '../../../models/registroRendimiento.model';
import { EvolucionFisicaDTO } from '../../../models/evolucionFisicaDTO.model';
Chart.register(...registerables);
@Component({
    selector: 'app-rutina-deportista',
    imports: [FormsModule, CommonModule, RouterModule],
    standalone: true,
    templateUrl: './rutina-deportista.component.html',
    styleUrl: './rutina-deportista.component.css'
})
export class RutinaDeportistaComponent implements OnInit,AfterViewInit{
  private dservice= inject(DeportistaService)
  private rservice = inject(RutinaJugadorService)
  private rtservice = inject(RutinaService)
  private pservice = inject(PosicionService)
  deportistas: DeportistaRendimiento[] = [];
  rutinasJugador: RutinaJugador[] = [];
  rutinas: Rutina[] = []
  jugadorSeleccionado: DeportistaRendimiento|null = null;
  rutinaSeleccionada!: number;
  mostrarModal = false;
  datos : EvolucionFisicaDTO[]|undefined = []
  deportista : Deportista | null = null;
  rutinasFiltradas : Rutina[]=[]
  mostrarRutinas = false;
  mostrarPerfil = false;
  searchTerm = '';
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
  metricasRendimiento: any[] = [];
  objetivosJugador: any[] = [];
  evolucionChart: any;
  medicionesJugador: any[] = [];
  totalJugadores: number = 0;
  totalRutinasActivas: number = 0;
  progresoPromedio: number = 0;
  jugadoresDestacados: number = 0;
  private chart: Chart | undefined = undefined;




  ngOnInit() {
    try{
      const token=localStorage.getItem("token")
      const id = Number(localStorage.getItem("id"))
      const deporte = Number(localStorage.getItem("idDeporte"))
      if(!token) {
        throw new Error("Not Token Found")
      }
      forkJoin({
        deportistas: this.dservice.listCheckRenObj(id,token),
        rutinas: this.rtservice.list(id, token),
        posiciones: this.pservice.list(deporte,token)
        
      }).subscribe({
        next: (data) => {
          this.deportistas = data.deportistas;
          this.rutinas = data.rutinas;
          this.totalJugadores = this.deportistas.length
          this.totalRutinasActivas = this.rutinas.length
          this.posiciones= data.posiciones
          this.deportistasFiltrados = this.deportistas
          this.renderizarGrafico()
          console.log(this.deportistas)
        },
        error: (err) => {
          console.error("Error loading data", err);
        }
      });
      
    }catch(error:any){
      alert(error.message)
    }
  }

  ngAfterViewInit() {
  this.renderizarGrafico();
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
    calcularProgreso(objetivosTotales:ObjetivoRendimiento[],objetivosIncompletos:ObjetivoRendimiento[],totalRutinas:number,rutinasCompletadas:number):number{
      console.log(objetivosTotales)
       console.log(objetivosIncompletos)
        console.log(totalRutinas)
         console.log(rutinasCompletadas)
      let objetivosCompletos = objetivosTotales.length-objetivosIncompletos.length
      console.log(objetivosCompletos)
      let total = objetivosTotales.length+ totalRutinas
      let progreso = objetivosCompletos + rutinasCompletadas
      let porcentaje = (progreso/ total)*100
      return Math.round(porcentaje)
    }
   normalizarProgreso(progreso: number): number {
    return Math.min(Math.max(progreso || 0, 0), 100);
  }
  async abrirModalRutinas(deportista: DeportistaRendimiento) {
     const token=localStorage.getItem("token")
    if(!token) {
      throw new Error("Not Token Found")
    }
    forkJoin({
      rutinasJugador: this.rservice.list(deportista.deportista.id, token),
    }).subscribe({
      next: (data) => {
        this.rutinasJugador = data.rutinasJugador;
      },
      error: (err) => {
        console.error("Error loading data", err);
      }
    });
    this.jugadorSeleccionado = deportista
    this.mostrarModalRutinas=true
  }
  async exportarDatos() {
  }
   aplicarFiltros() {
    this.filtrarDeportistas();
    this.mostrarFiltros = false;
  }
  async abrirModalPerfil(deportista: DeportistaRendimiento) {
    this.jugadorSeleccionado = deportista;
    this.mostrarModalPerfil = true
    setTimeout(() => this.renderizarGrafico(), 0);
  }

  limpiarFiltros() {
    this.searchTerm = '';
    this.filtroPosicion = '';
    this.filtrarDeportistas();
    this.mostrarFiltros = false;
  }
  abrirModal(deportista: DeportistaRendimiento) {
    const token=localStorage.getItem("token")
    if(!token) {
      throw new Error("Not Token Found")
    }
    this.mostrarModal = true;
    forkJoin({
      rutinasJugador: this.rservice.list(deportista.deportista.id, token),
    }).subscribe({
      next: (data) => {
        this.rutinasJugador = data.rutinasJugador;
        this.rutinasFiltradas = this.borrarRepetidas(this.rutinasJugador, this.rutinas, deportista.deportista.posicion.nombre);
      },
      error: (err) => {
        console.error("Error loading data", err);
      }
    });
    this.jugadorSeleccionado = deportista
  }
    getTrend(metricas: EvolucionFisicaDTO[]|undefined, tipo: string): number {
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

  // Obtener y filtrar los datos válidos
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


  getUltimaMetrica(id:number|undefined, mid:number){

  }

  calcularProgresoGeneral(deportista: any){

  }
  calcularProgresoMetrica(jugadorSeleccionado:number|undefined, metrica:number):number{
    return 2;
  }
  getObjetivo(id:number|undefined, metrica:number){

  }
  marcarDestacado(){

  }
  generarReporte(){

  }
    verDetalleRutina(rutina: any) {
    this.cerrarModal();
  }
  async quitarRutina(rutinaJugador: RutinaJugador) {
    const token=localStorage.getItem("token")
    if(!token) {
      throw new Error("Not Token Found")
    }
    this.rservice.delete(rutinaJugador.id,token).subscribe({
      next:(data)=>{
        if(data.success){
          alert("eliminado")
        }else{
          alert("error")
        }
      },
      error:(err)=>{
        console.error(err)
      }
    })
  }

  asignarRutina(deportista:DeportistaRendimiento| null ) {
    const token=localStorage.getItem("token")
    if(!token) {
      throw new Error("Not Token Found")
    }
    const nuevaVinculacion: RutinaJugadorDTO = {
          idJugador: this.jugadorSeleccionado?.deportista?.id,
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
    abrirModalAsignar(deportista: any) {
    this.jugadorSeleccionado = deportista;
    this.mostrarModalAsignar = true;
    this.busquedaRutina = '';
    this.filtroTipoRutina = '';
    this.filtrarRutinas();
  }
   filtrarRutinas() {
    this.rutinasFiltradas = this.rutinas.filter(r => {
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
   seleccionarRutina(rutina: any) {
    this.rutinaSeleccionada = rutina;
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
