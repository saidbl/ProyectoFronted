import { AfterViewInit, Component, ElementRef, OnInit ,ViewChild,inject} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TipoMetricaDTO } from '../../../models/tipoMetricaDTO.model';
import { TipoMetricaService } from '../../../services/tipoMetrica.service';
import { TipoMetrica } from '../../../models/tipoMetrica.model';
import { RegistroRendimientoDTO } from '../../../models/registroRendimientoDTO.model';
import { RegistroRendimientoService } from '../../../services/registroRendimiento.service';
import { RegistroRendimiento } from '../../../models/registroRendimiento.model';
import { forkJoin, Subject, Subscription, takeUntil } from 'rxjs';
import { ObjetivoRendimientoDTO } from '../../../models/objetivoRendimientoDTO.model';
import { ObjetivoRendimiento } from '../../../models/objetivoRendimiento.model';
import { ObjetivoRendimientoService } from '../../../services/objetivoRendimiento.service';
import { MedicionFisicaService } from '../../../services/medicionFisica.service';
import { EvolucionFisicaDTO } from '../../../models/evolucionFisicaDTO.model';
import { Chart, registerables } from 'chart.js';
import { CheckInRutinaService } from '../../../services/checkinrutina.service';
import { ProgresoObjetivoDTO } from '../../../models/progresoObjetivoDTO.model';
import { MatIcon } from '@angular/material/icon';
import { MedicionFisica } from '../../../models/medicionFisica.model';
import { MatIconModule } from '@angular/material/icon';
import { MedicionFisicaDTO } from '../../../models/medicionFisicaDTO.model';
import { Router, RouterModule } from '@angular/router';
Chart.register(...registerables);
@Component({
  selector: 'app-rendimiento',
  imports: [FormsModule,CommonModule,ReactiveFormsModule,MatTooltipModule,MatIcon,MatIconModule,RouterModule ],
  templateUrl: './rendimiento.component.html',
  styleUrl: './rendimiento.component.css'
})
export class RendimientoComponent implements OnInit,AfterViewInit{
  nombre: string | null = '';
  apellido: string | null = '';
  deporte: string = '';
  private mfservice = inject(MedicionFisicaService)
  private tmservice = inject(TipoMetricaService)
  private rrservice = inject(RegistroRendimientoService)
  private orservice= inject (ObjetivoRendimientoService)
  private crservice= inject(CheckInRutinaService)
  private oservice = inject(ObjetivoRendimientoService)
  posicion: string | null = ''
  currentView : 'metrics' | 'records' | 'goals' | 'stats' | 'medicion' = 'metrics';
  showrendimientoForm= false
  showgoalsForm= false
  loading = true;
  metricForm: FormGroup ;
  recordForm: FormGroup;
  goalForm: FormGroup;
  medicionForm:FormGroup
  sports: any[] = [];
  metrics: TipoMetrica[] = [];
  athleteMetrics: any[] = [];
  records: RegistroRendimiento[] = [];
  goals: ObjetivoRendimiento[] = [];
  filteredRecords: RegistroRendimiento[] = [];
  mediciones : MedicionFisica[] = []
  athleteProfile: any;
  selectedMetric: string = "";
  dateRange = { start: new Date(), end: new Date() };
  showmedicionForm: boolean = false
  performanceChart: any;
  showmetricaForm: boolean =false
  @ViewChild('evolucionChart') evolucionChart!: ElementRef;
  @ViewChild('rutinasChart') private chartRef!: ElementRef;
  objetivos: ProgresoObjetivoDTO[] = [];
  ultimaMedicion: MedicionFisica|null = null
  chart2!: Chart;
  datosC: any;
  datos: EvolucionFisicaDTO[] = [];
  isLoading = false;
  errorMessage: string | null = null;
  private chart: Chart | null = null;
  private subs: Subscription[] = [];
  graficoRenderizado:boolean = false
  rangos = [
    { value: '1m', label: 'Último mes' },
    { value: '3m', label: 'Últimos 3 meses' },
    { value: '6m', label: 'Últimos 6 meses' },
    { value: '1a', label: 'Último año' },
    { value: 'todo', label: 'Todo' }
  ];
  rangoSeleccionado = '3m';
  navigation = [
  { name: 'Principal', route: '..', icon: 'home' },
  { name: 'Eventos', route: '../proximoseventos', icon: 'event' },
  { name: 'Equipos', route: '../equipos', icon: 'groups' },
  { name: 'CheckIn', route: '../check', icon: 'event' },
  { name: 'Rendimiento', route: '../rendimiento', icon: 'analytics' }
];
  
  constructor(
    private fb: FormBuilder,
  public router:Router) {
    const nextWeek = new Date();
nextWeek.setDate(nextWeek.getDate() + 7);
    this.metricForm = this.fb.group({
      nombre: ['', Validators.required],
      unidad: ['', Validators.required],
      esObjetivo: [false]
    });
    this.recordForm = this.fb.group({
      idmetrica: [null, Validators.required],
      valor: ['', [Validators.required, Validators.min(0)]],
      fecha: [new Date(), Validators.required],
      comentarios: ['']
    });
    this.goalForm = this.fb.group({
      idmetrica: ['', Validators.required],
      valorObjetivo: ['', [Validators.required, Validators.min(0)]],
      fechaObjetivo: [nextWeek, Validators.required],
      prioridad: [1, [Validators.min(1), Validators.max(5)]],
    });
    this.medicionForm = this.fb.group({
      fecha:[new Date(), Validators.required],
      peso:[0, [Validators.required,Validators.min(10), Validators.max(200)]],
      estatura:[0, [Validators.required,Validators.min(100), Validators.max(250)]],
      porcentajeGrasa:[0, [Validators.required,Validators.min(0), Validators.max(100)]],
      masaMuscular:[0, [Validators.required,Validators.min(0), Validators.max(200)]],
      circunferenciaBrazo:[0, [Validators.required,Validators.min(0), Validators.max(200)]],
      circunferenciaCintura:[0, [Validators.required,Validators.min(0), Validators.max(200)]],
      circunferenciaCadera:[0, [Validators.required,Validators.min(0), Validators.max(200)]],
      presionArterial:['', [Validators.required]],
      frecuenciaCardiacaReposo:[0, [Validators.required,Validators.min(0), Validators.max(200)]],
      notas:['', [Validators.required]],
    })
  }

  private destroy$ = new Subject<void>();

ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}
  ngOnInit(): void {
    this.loadInitialData();
    this.cargarDatos();
    const today = new Date();
  const pastDate = new Date();
  pastDate.setDate(today.getDate() - 28);

  this.dateRange = {
    start: pastDate,
    end: today
  };

  this.filterRecords();
  }
  ngAfterViewChecked() {
  if (this.currentView === 'stats' && !this.graficoRenderizado && this.evolucionChart) {
    this.graficoRenderizado = true;
    this.renderizarGrafico();
    this.renderizarGrafico2()
  }
}
   cargarDatos(): Promise<void> {
  return new Promise((resolve, reject) => {
    const token = localStorage.getItem("token");
    const id = localStorage.getItem("id");

    if (!token) {
      reject(new Error("No token found"));
      return;
    }
    this.isLoading = true;
    this.errorMessage = null;
    const sub1 = this.mfservice.getEvolucionFisica(Number(id), this.rangoSeleccionado, token).pipe(takeUntil(this.destroy$)).subscribe({
        next: (data) => {
          this.datos = data;
          this.isLoading = false;
          resolve(); 
        },
        error: (err) => {
          this.errorMessage = err.message || 'Error al cargar los datos';
          this.isLoading = false;
          reject(err);
        }
      });
    this.subs.push(sub1);
    this.crservice.getCumplimientoRutinas(Number(id), this.rangoSeleccionado, token).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => this.datosC = data,
      error: (err) => this.errorMessage = err.error?.message || 'Error al cargar los datos'
    });
    this.orservice.getProgresoObjetivos(Number(id), token).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data)=> {
        this.objetivos = data
        console.log(this.objetivos)
      },
      error: (err) => this.errorMessage = 'Error al cargar los objetivos'
    });
  });
}

  getClasePorcentaje(porcentaje: number): string {
    if (porcentaje >= 80) return 'bg-success';
    if (porcentaje >= 50) return 'bg-warning';
    return 'bg-danger';
  }
  renderizarGrafico2() {
  if (!this.chartRef?.nativeElement || !this.datos) return;

  if (this.chart2) {
    this.chart2.destroy();
  }

  const ctx = this.chartRef.nativeElement.getContext('2d');
  const gradient = ctx.createLinearGradient(0, 0, 0, 300);
  gradient.addColorStop(0, '#34d399');  
  gradient.addColorStop(1, '#059669');  
  
  this.chart2 = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Rutinas Completadas', 'Rutinas Incompletas'],
      datasets: [{
        data: [this.datosC.completadas, this.datosC.incompletas],
        backgroundColor: [
          gradient,
          'rgba(107, 114, 128, 0.7)' 
        ],
        borderColor: [
          'rgba(6, 78, 59, 0.8)',    
          'rgba(55, 65, 81, 0.8)'  
        ],
        borderWidth: 2,
        borderRadius: 4,               
        hoverOffset: 15,               
        spacing: 2                   
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '75%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#d1d5db',        
            font: {
              size: 13,
              family: "'Inter', sans-serif"
            },
            padding: 20,
            usePointStyle: true,
            pointStyle: 'circle'
          }
        },
        tooltip: {
          backgroundColor: 'rgba(17, 24, 39, 0.9)',
          titleColor: '#34d399',
          bodyColor: '#d1d5db',
          borderColor: 'rgba(31, 41, 55, 0.8)',
          borderWidth: 1,
          padding: 12,
          cornerRadius: 8,
          displayColors: false,
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.parsed || 0;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = Math.round((value / total) * 100);
              return `${label}: ${value} (${percentage}%)`;
            }
          }
        },
        title: {
          display: true,
          text: `CUMPLIMIENTO DE RUTINAS`,
          color: '#e5e7eb',
          font: {
            size: 18,
            weight: 'bold',
            family: "'Inter', sans-serif"
          },
          padding: {
            top: 10,
            bottom: 20
          }
        },
        subtitle: {
          display: true,
          text: `Completadas ${this.datosC.porcentajeCompletadas}%`,
          color: '#34d399',
          font: {
            size: 24,
            weight: 'bold',
            family: "'Inter', sans-serif"
          },
          padding: {
            bottom: 20
          }
        }
      },
      animation: {
        animateRotate: true,
        animateScale: true,
        duration: 1500,
        easing: 'easeOutQuart'
      }
    }
  });
}

  getDiasOrdenados(): string[] {
    const ordenDias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    return ordenDias.filter(dia => this.datosC?.rutinasPorDia[dia]);
  }
  ngAfterViewInit() {
    this.cargarDatos();
  }
  renderizarGrafico() {
  if (this.chart) {
    this.chart.destroy();  
  }
  
  const ctx = this.evolucionChart.nativeElement.getContext('2d');
  if (!ctx) {
    console.error('No se pudo obtener el contexto');
    return;
  }
  const createGradient = (color1:string, color2:string) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);
    return gradient;
  };

  const pesoGradient = createGradient('rgba(56, 189, 248, 0.4)', 'rgba(56, 189, 248, 0.05)');
  const imcGradient = createGradient('rgba(168, 85, 247, 0.4)', 'rgba(168, 85, 247, 0.05)');
  const masaGradient = createGradient('rgba(16, 185, 129, 0.4)', 'rgba(16, 185, 129, 0.05)');

  this.chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: this.datos.map(d => new Date(d.fecha).toLocaleDateString()),
      datasets: [
        {
          label: 'Peso (kg)',
          data: this.datos.map(d => d.peso),
          borderColor: '#0ea5e9',
          backgroundColor: pesoGradient,
          borderWidth: 3,
          pointRadius: 5,
          pointBackgroundColor: '#0ea5e9',
          pointHoverRadius: 7,
          pointHoverBorderWidth: 2,
          pointHoverBorderColor: '#fff',
          tension: 0.3,
          fill: true,
          yAxisID: 'y'
        },
        {
          label: 'IMC',
          data: this.datos.map(d => d.imc),
          borderColor: '#a855f7',
          backgroundColor: imcGradient,
          borderWidth: 3,
          pointRadius: 5,
          pointBackgroundColor: '#a855f7',
          pointHoverRadius: 7,
          pointHoverBorderWidth: 2,
          pointHoverBorderColor: '#fff',
          tension: 0.3,
          fill: true,
          yAxisID: 'y1'
        },
        {
          label: 'Masa Muscular (kg)',
          data: this.datos.map(d => d.masaMuscular),
          borderColor: '#10b981',
          backgroundColor: masaGradient,
          borderWidth: 3,
          pointRadius: 5,
          pointBackgroundColor: '#10b981',
          pointHoverRadius: 7,
          pointHoverBorderWidth: 2,
          pointHoverBorderColor: '#fff',
          tension: 0.3,
          fill: true,
          yAxisID: 'y'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'EVOLUCIÓN FÍSICA',
          color: '#f3f4f6',
          font: {
            size: 18,
            weight: 'bold',
            family: "'Inter', sans-serif"
          },
          padding: {
            top: 10,
            bottom: 20
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: 'rgba(17, 24, 39, 0.95)',
          titleColor: '#d1d5db',
          bodyColor: '#f9fafb',
          borderColor: 'rgba(31, 41, 55, 0.8)',
          borderWidth: 1,
          padding: 12,
          cornerRadius: 8,
          usePointStyle: true,
          callbacks: {
            label: function(context) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed.y !== null) {
                label += context.parsed.y.toFixed(1);
              }
              return label;
            },
            title: function(context) {
              return `Fecha: ${context[0].label}`;
            }
          }
        },
        legend: {
          position: 'top',
          labels: {
            color: '#d1d5db',
            font: {
              size: 12,
              family: "'Inter', sans-serif"
            },
            padding: 20,
            usePointStyle: true,
            pointStyle: 'circle'
          }
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'FECHA',
            color: '#9ca3af',
            font: {
              size: 12,
              weight: 'bold',
              family: "'Inter', sans-serif"
            }
          },
          grid: {
            color: 'rgba(55, 65, 81, 0.3)',
          },
          border: {
      display: false // <- correcta en Chart.js v4
    },
          ticks: {
            color: '#9ca3af'
          }
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: 'PESO Y MASA MUSCULAR (kg)',
            color: '#9ca3af',
            font: {
              size: 12,
              weight: 'bold',
              family: "'Inter', sans-serif"
            }
          },
          grid: {
            color: 'rgba(55, 65, 81, 0.3)',
          },
          border: {
      display: false // <- correcta en Chart.js v4
    },
          ticks: {
            color: '#9ca3af'
          }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: 'ÍNDICE DE MASA CORPORAL (IMC)',
            color: '#9ca3af',
            font: {
              size: 12,
              weight: 'bold',
              family: "'Inter', sans-serif"
            }
          },
          grid: {
            drawOnChartArea: false,
            color: 'rgba(55, 65, 81, 0.3)',
          },
          border: {
      display: false 
    },
          ticks: {
            color: '#9ca3af'
          }
        }
      },
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
      },
      animation: {
        duration: 1500,
        easing: 'easeOutQuart'
      },
      elements: {
        line: {
          tension: 0.3
        }
      }
    }
  });
}
  async cambiarRango(nuevoRango: string) {
  this.rangoSeleccionado = nuevoRango;
  try {
    await this.cargarDatos(); 
    this.renderizarGrafico();
  } catch (err) {
    console.error('Error al cambiar el rango:', err);
  }
}

  mostrarFormRendimiento(){
    this.showrendimientoForm= true
  }
  mostrarFormMetrica(){
    this.showmetricaForm=true
  }
  mostrarFormObjetivos(){
    this.showgoalsForm=true
  }
  mostrarFormMedicion(){
    this.showmedicionForm=true
  }
  cancelar(){
    this.showmetricaForm=false
  }
  loadInitialData() {
    const token =localStorage.getItem("token")
    const id = localStorage.getItem("id")
    if(!token) {
      throw new Error("Not Token Found")
    }
    forkJoin({
                metrics: this.tmservice.list(Number(id), token),
                records: this.rrservice.list(Number(id), token),
                goals : this.orservice.list(Number(id),token),
                mediciones: this.mfservice.list(Number(id),token),
                medicion: this.mfservice.obtenerUltimaMedicion(Number(id),token)
              }).pipe(takeUntil(this.destroy$)).subscribe({
                next: (data) => {
                  this.metrics = data.metrics;
                  this.records = data.records;
                  this.mediciones=data.mediciones
                  this.ultimaMedicion = data.medicion
                  console.log(this.records)
                  this.nombre = localStorage.getItem('nombre') || '';
                  this.apellido = localStorage.getItem('apellido') || '';
                  this.posicion = localStorage.getItem('posicion') || '';
                  const foto = localStorage.getItem('fotoPerfil');
                  console.log(this.metrics)
                  this.goals = data.goals
                   console.log(this.goals)
                  this.filteredRecords = data.records
                  this.loading= false
                },
                error: (err) => {
                  console.error("Error loading data", err);
                  this.loading=false
                }
              });
  }

  filterRecords(): void {
  this.filteredRecords = [...this.records];
  if (this.selectedMetric) {
    this.filteredRecords = this.filteredRecords.filter(r => r.metrica.nombre === this.selectedMetric);
  }
  if (this.dateRange.start && this.dateRange.end) {
    const startDate = new Date(this.dateRange.start);
    const endDate = new Date(this.dateRange.end);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    this.filteredRecords = this.filteredRecords.filter(r => {
      const recordDate = new Date(r.fecha);
      return recordDate >= startDate && recordDate <= endDate;
    });
  }
}
deleteObj(obj:ProgresoObjetivoDTO) {
  const token =localStorage.getItem("token")
    if(!token) {
      throw new Error("Not Token Found")
    }
    this.orservice.eliminar(obj.id,token).pipe(takeUntil(this.destroy$)).subscribe({
      next:(data)=>{
        if(data.success){
          alert("Eliminado")
          this.loadInitialData(); // Para recargar datos principales
        if (this.currentView === 'stats') {
          this.cargarDatos().then(() => {
            this.renderizarGrafico();
            this.renderizarGrafico2();
          });
        }
        }else{
          alert("No elimiando")
        }
      },
      error:(err)=>{
        console.log(err)
      }
    })
}


  async addMetric(){
    const token =localStorage.getItem("token")
    if(!token) {
      throw new Error("Not Token Found")
    }
    if (this.metricForm.invalid) return;
    const newMetric : TipoMetricaDTO= this.metricForm.value
    newMetric.iddeporte = Number(localStorage.getItem("idDeporte"))
    newMetric.iddeportista = Number(localStorage.getItem("id"))
    console.log(newMetric)
    this.tmservice.add(newMetric,token).pipe(takeUntil(this.destroy$)).subscribe({
      next:(data)=>{
        console.log(data)
        this.loadInitialData(); // Para recargar datos principales
        if (this.currentView === 'stats') {
          this.cargarDatos().then(() => {
            this.renderizarGrafico();
            this.renderizarGrafico2();
          });
        }

      },
      error:(err)=>{
        console.error(err)
      }
    })
  }

  async addRecord(){
    console.log("hola")
    const token =localStorage.getItem("token")
    if(!token) {
      throw new Error("Not Token Found")
    }
    console.log("hola")
    if (this.recordForm.invalid) return;
    console.log("hola")
    const newRecord : RegistroRendimientoDTO= this.recordForm.value
    newRecord.iddeportista = Number(localStorage.getItem("id"))
    console.log(newRecord)
    this.rrservice.add(newRecord,token).pipe(takeUntil(this.destroy$)).subscribe({
      next:(data)=>{
        console.log(data)
        this.loadInitialData(); // Para recargar datos principales
if (this.currentView === 'stats') {
  this.cargarDatos().then(() => {
    this.renderizarGrafico();
    this.renderizarGrafico2();
  });
}

      },
      error:(err)=>{
        console.error(err)
      }
    })
  }

  async addGoal(){
    console.log("hola")
    const token =localStorage.getItem("token")
    if(!token) {
      throw new Error("Not Token Found")
    }
    if (this.goalForm.invalid) return;
    const newGoal : ObjetivoRendimientoDTO= this.goalForm.value
    newGoal.iddeportista = Number(localStorage.getItem("id"))
    this.orservice.add(newGoal,token).pipe(takeUntil(this.destroy$)).subscribe({
      next:(data)=>{
        alert("Exito")
        this.loadInitialData(); // Para recargar datos principales
if (this.currentView === 'stats') {
  this.cargarDatos().then(() => {
    this.renderizarGrafico();
    this.renderizarGrafico2();
  });
}
      },
      error:(err)=>{
        console.error(err)
      }
    })
  }
  addMedicion(){
    const token =localStorage.getItem("token")
    if(!token) {
      throw new Error("Not Token Found")
    }
    if (this.medicionForm.invalid) return;
    const newMedicion : MedicionFisicaDTO= this.medicionForm.value
    newMedicion.idDeportista = Number(localStorage.getItem("id"))
    console.log(newMedicion)
    this.mfservice.add(newMedicion,token).pipe(takeUntil(this.destroy$)).subscribe({
      next:(data)=>{
        console.log(data)
        alert("agregado"+data)
        this.loadInitialData(); // Para recargar datos principales
if (this.currentView === 'stats') {
  this.cargarDatos().then(() => {
    this.renderizarGrafico();
    this.renderizarGrafico2();
  });
}
      },
      error:(err)=>{
        console.error(err)
      }
    })
  }

  toggleGoalCompletion(goal: any): void {
    const token =localStorage.getItem("token")
    if(!token) {
      throw new Error("Not Token Found")
    }
    this.orservice.completado(goal.id,token).pipe(takeUntil(this.destroy$)).subscribe({
      next:(data)=>{
        alert("Completado"+data)
        this.loadInitialData(); // Para recargar datos principales
if (this.currentView === 'stats') {
  this.cargarDatos().then(() => {
    this.renderizarGrafico();
    this.renderizarGrafico2();
  });
}
      },
      error:(err)=>{
        console.error(err)
      }
    })
  }

  deleteItem(type: 'metric' | 'record' | 'goal', id: number): void {
    const token = localStorage.getItem("token")
    if(!token) {
      throw new Error("Not Token Found")
    }
    if (type == "metric"){
      this.tmservice.delete(id,token).pipe(takeUntil(this.destroy$)).subscribe({
        next:(data)=>{
          if(data.success){
            alert("Exito al eliminar")
            this.loadInitialData(); // Para recargar datos principales
if (this.currentView === 'stats') {
  this.cargarDatos().then(() => {
    this.renderizarGrafico();
    this.renderizarGrafico2();
  });
}
          }else{
            alert("error")
          }
        },
        error:(err)=>{
          console.log(err)
        }
      })
    }else if(type === "record"){
      this.rrservice.delete(id,token).pipe(takeUntil(this.destroy$)).subscribe({
        next:(data)=>{
          if(data.success){
            alert("Exito")
            this.loadInitialData(); // Para recargar datos principales
if (this.currentView === 'stats') {
  this.cargarDatos().then(() => {
    this.renderizarGrafico();
    this.renderizarGrafico2();
  });
}
          }
        },
        error:(err)=>{
          console.log(err)
        }
      })

    }
  }
}
