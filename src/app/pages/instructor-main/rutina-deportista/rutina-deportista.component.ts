import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, inject, OnInit, Output, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ValidationErrors, Validators } from '@angular/forms';
import { DeportistaService } from '../../../services/deportista.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
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
import { InstructorService } from '../../../services/instructor.service';
import { Posicion } from '../../../models/posicion.model';

Chart.register(...registerables);
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-rutina-deportista',
    imports: [FormsModule, CommonModule, RouterModule,MatIcon,ReactiveFormsModule],
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
  private iservice = inject(InstructorService)
  @ViewChild('rutinasChart') private chartRef!: ElementRef;
  deportistas: DeportistaRendimiento[] = [];
  rutinasF : Rutina[]=[]
  rutinasJugador: RutinaJugador[] = [];
  disabledbutton : boolean = false
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
  
  nombre: string = '';
  apellido: string = '';
  previewImage: string | ArrayBuffer | null = null;
  metricasRendimiento: any[] = [];
  objetivosJugador: any[] = [];
  fotoPerfilFile: File | null = null;
  modalRegistroJugador:boolean = false
  posiciones: Posicion[] = [];
  evolucionChart: any;
  medicionesJugador: any[] = [];
  totalJugadores: number = 0;
  totalRutinasActivas: number = 0;
   showUserDropdown: boolean = false;
   fotoPerfil: string = "http://localhost:8080/";
  progresoPromedio: number = 0;
  jugadoresDestacados: number = 0;
  private chart: Chart | undefined = undefined;
  @Output() close = new EventEmitter<void>();
  jugadorForm: FormGroup;
  navigation = [
  { name: 'Eventos', route: '../equipoEvento', icon: 'event' },
  { name: 'Principal', route: '..', icon: 'people' },
  { name: 'Equipos', route: '../crearEquipos', icon: 'groups' },
  { name: 'Rutinas', route: '../rutinas', icon: 'fitness_center' },
  { name: 'Reportes', route: '../reportes', icon: 'analytics' }
];
userAvatar:string= ""
constructor(public router: Router,private fb: FormBuilder,private cd: ChangeDetectorRef) {
  this.jugadorForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]],
  apellido: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]],
  email: ['', [Validators.required, Validators.email]],
  password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(30)]],
  id_instructor:['', [Validators.required]],
  id_deporte: [Number(localStorage.getItem("idDeporte")), [Validators.required]],
  id_posicion: ['', [Validators.required]],
  genero: ['', [Validators.required, Validators.pattern(/^(masculino|femenino)$/i)]],
  fecha_nacimiento: ['', [Validators.required,this.mayorDeEdadValidator,this.noFuturoValidator]],
  telefono: ['', [Validators.pattern(/^\d{7,15}$/)]], 
  direccion: ['', [Validators.maxLength(200)]],
  fotoPerfil: [null, Validators.required],
  peso: ['', [Validators.required, Validators.min(20), Validators.max(300)]], 
  estatura: ['', [Validators.required, Validators.min(100), Validators.max(250)]], // en cm

  porcentaje_grasa: ['', [Validators.min(0), Validators.max(100)]], // % corporal
  masa_muscular: ['', [Validators.min(0), Validators.max(100)]], // % corporal (o puedes ajustar el límite superior si se usa en kg)

  circunferencia_brazo: ['', [Validators.min(10), Validators.max(80)]],
  circunferencia_cintura: ['', [Validators.min(30), Validators.max(200)]], 
  circunferencia_cadera: ['', [Validators.min(30), Validators.max(200)]],

  presion_arterial: ['', [Validators.pattern(/^\d{2,3}\/\d{2,3}$/)]], 
  frecuencia_cardiaca_reposo: ['', [Validators.min(30), Validators.max(200)]], 

  notas: ['', [Validators.maxLength(500)]]
    });
}


  ngOnInit() {
    this.cargarDatosIniciales()
  }
  private cargarDatosIniciales(){
    try{
      const fotoPerfil = localStorage.getItem("fotoPerfil")
      const nom=localStorage.getItem("nombre")
      const ap = localStorage.getItem("apellido")
      const token=localStorage.getItem("token")
      const id = Number(localStorage.getItem("id"))
      const deporte = Number(localStorage.getItem("idDeporte"))
      if(!token) {
        this.mostrarErrorAutenticacion();
        return;
      }
       this.cargando = true;
            this.cdRef.markForCheck();
      forkJoin({
        deportistas: this.dservice.listCheckRenObj(id,token).pipe(
        takeUntil(this.destroy$)),
        rutinas: this.rtservice.list(id, token),
        posiciones: this.pservice.list(deporte,token)
      }).subscribe({
        next: (data) => {
          this.deportistas=data.deportistas
          this.rutinas = data.rutinas;
          this.totalJugadores = this.deportistas.length
          this.totalRutinasActivas = this.rutinas.length
          this.posiciones= data.posiciones
          this.deportistasFiltrados = this.deportistas
          this.renderizarGrafico()
          this.renderizarGrafico2();
          this.fotoPerfil = this.fotoPerfil+ fotoPerfil
          this.nombre=nom ?? ''
          this.apellido= ap ?? ''
          this.progresoPromedio= this.getProgresoPromedioFinal()
          this.cdRef.markForCheck();
          
        },
        error: (err) => {
          console.error("Error loading data", err);
                    Swal.fire('Error', 'Error al cargar los datos: ' + err.message, 'error');
                    this.cargando = false;
                    this.cdRef.markForCheck();
        }
      });
      
    }catch(error:any){
      console.error("Initialization error", error);
            Swal.fire('Error', error.message, 'error');
            this.cargando = false;
            this.cdRef.markForCheck();
    }
  }
  noFuturoValidator(control: AbstractControl): ValidationErrors | null {
  const fecha = new Date(control.value);
  const hoy = new Date();
  return fecha > hoy ? { fechaFutura: true } : null;
}
  mayorDeEdadValidator(control: AbstractControl): ValidationErrors | null {
  const fechaNacimiento = new Date(control.value);
  const hoy = new Date();
  
  const edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
  const mes = hoy.getMonth() - fechaNacimiento.getMonth();
  const dia = hoy.getDate() - fechaNacimiento.getDate();

  const esMayorDeEdad =
    edad > 14 ||
    (edad === 14 && (mes > 0 || (mes === 0 && dia >= 0)));

  return esMayorDeEdad ? null : { menorDeEdad: true };
}

  ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
  this.destruirGraficos();
}
onFileChange(event: any): void {
  const fileInput = event.target as HTMLInputElement;
  const file: File | null = fileInput.files?.[0] || null;
  if (!file) return;

  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
  const maxSizeMB = 2;

  if (!allowedTypes.includes(file.type)) {
    alert('Tipo de archivo no permitido. Usa PNG o JPG.');
    fileInput.value = '';
    return;
  }

  if (file.size > maxSizeMB * 1024 * 1024) {
    alert('El archivo supera los 2MB.');
    fileInput.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    this.previewImage = reader.result; 
    this.fotoPerfilFile = file;
    this.jugadorForm.get('fotoPerfil')?.setValue(file);
    this.cd.detectChanges(); 
  };
  reader.readAsDataURL(file);
}


private mostrarErrorAutenticacion(): void {
        Swal.fire({
            icon: 'error',
            title: 'Error de autenticación',
            text: 'Tu sesión ha expirado o no estás autenticado',
            confirmButtonText: 'Entendido',
            allowOutsideClick: false
        }).then(() => {
            this.router.navigate(['/login']);
        });
    }

  ngAfterViewInit() {
  this.renderizarGrafico();
  this.renderizarGrafico2();
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
private showSuccessAlert(title: string, message: string): void {
    Swal.fire({
      title: title,
      text: message,
      icon: 'success',
      confirmButtonColor: '#10b981',
      background: '#1f2937',
      color: '#fff',
      iconColor: '#10b981',
      timer: 3000,
      timerProgressBar: true
    });
  }
private showErrorAlert(title: string, message: string): void {
    Swal.fire({
      title: title,
      text: message,
      icon: 'error',
      confirmButtonColor: '#ef4444',
      background: '#1f2937',
      color: '#fff',
      iconColor: '#ef4444'
    });
  }
  private showWarningAlert(title: string, message: string): void {
      Swal.fire({
        title: title,
        text: message,
        icon: 'warning',
        confirmButtonColor: '#f59e0b',
        background: '#1f2937',
        color: '#fff',
        iconColor: '#f59e0b'
      });
    }
onSubmit(): void {
  const id = Number(localStorage.getItem("id"))
  const deporte = Number(localStorage.getItem("idDeporte"))
  const token=localStorage.getItem("token")
  this.jugadorForm.get('id_instructor')?.setValue(id);
   this.jugadorForm.get('id_deporte')?.setValue(deporte);
      if(!token) {
        this.mostrarErrorAutenticacion();
        return;
      }
    if (this.jugadorForm.invalid) {
       this.showErrorAlert("Formulario Invalido","Favor de llenar todos los campos o corregir validaciones")
      return;
    }
    const formData = new FormData();
    Object.keys(this.jugadorForm.controls).forEach(key => {
      if (key !== 'foto_perfil') {
        formData.append(key, this.jugadorForm.get(key)?.value);
      }
    });
    if (this.fotoPerfilFile) {
      const foto = this.jugadorForm.get('fotoPerfil')?.value;
      formData.append('foto_perfil', foto);
    }
    const medicionData = {
      fecha: new Date().toISOString().split('T')[0],
      peso: this.jugadorForm.get('peso')?.value,
      estatura: this.jugadorForm.get('estatura')?.value,
      porcentajeGrasa: this.jugadorForm.get('porcentaje_grasa')?.value,
      masaMuscular: this.jugadorForm.get('masa_muscular')?.value,
      circunferenciaBrazo: this.jugadorForm.get('circunferencia_brazo')?.value,
      circunferenciaCintura: this.jugadorForm.get('circunferencia_cintura')?.value,
      circunferenciaCadera: this.jugadorForm.get('circunferencia_cadera')?.value,
      presionArterial: this.jugadorForm.get('presion_arterial')?.value,
      frecuenciaCardiacaReposo: this.jugadorForm.get('frecuencia_cardiaca_reposo')?.value,
      notas: this.jugadorForm.get('notas')?.value
    };

    formData.append('medicion', JSON.stringify(medicionData));

    this.dservice.add(token,formData).subscribe({
      next:(data) => {
        console.log('Jugador registrado con éxito', data);
        this.closeModal();
        this.showSuccessAlert("Registrado","Jugador registrado correctamente")
        this.modalRegistroJugador= false
        this.cargarDatosIniciales()
      },
      error:(err) => {
        console.error('Error registrando jugador', err);
        this.showErrorAlert(err.error,"Error de registro")
      }
});
  }

  closeModal(): void {
    this.close.emit();
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
     if (!metricas || metricas.length < 1) {
    return 0;
  }


  if (tipo === "peso") {
    const actual = metricas[metricas.length - 1].peso
    console.log(metricas[metricas.length - 1].peso)

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
  
    
    getTrend(metricas: EvolucionFisicaDTO[] | undefined, tipo: string): number {
  console.log(metricas);
  if (!metricas || metricas.length < 2) {
    return 0;
  }

  const ultima = metricas[metricas.length - 1];
  const anterior = metricas[metricas.length - 2];

  let actualValor: number = 0;
  let anteriorValor: number = 0;

  switch (tipo) {
    case "peso":
      actualValor = ultima.peso;
      anteriorValor = anterior.peso;
      break;
    case "imc":
      actualValor = ultima.imc;
      anteriorValor = anterior.imc;
      break;
    case "porcentaje_grasa":
      actualValor = ultima.porcentajeGrasa;
      anteriorValor = anterior.porcentajeGrasa;
      break;
    default:
      return 0;
  }

  if (anteriorValor === 0) return 0;

  const cambioPorcentual = ((actualValor - anteriorValor) / anteriorValor) * 100;
  return Math.round(cambioPorcentual);
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
            this.mostrarErrorAutenticacion();
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

  asignarRutina() {
        const token = localStorage.getItem("token");
        if (!token) {
            this.mostrarErrorAutenticacion();
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
                this.abrirModalAsignar(this.jugadorSeleccionado!);
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
      this.mostrarErrorAutenticacion();
            return;
    }
    this.jugadorSeleccionado = deportista;
        this.cargando = true;
        this.cdRef.markForCheck();
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
        this.mostrarModalAsignar = true;
                this.cargando = false;
                this.cdRef.markForCheck();
      },
      error: (err) => {
        console.error("Error loading data", err);
                Swal.fire('Error', 'No se pudieron cargar las rutinas: ' + err.message, 'error');
                this.cargando = false;
                this.cdRef.markForCheck();
      }
    });
    if(this.rutinasFiltradas.length> 0){
      this.disabledbutton=true
    }
    this.busquedaRutina = '';
    this.filtroTipoRutina = '';
  }
   private destruirGraficos(): void {
        if (this.chart) {
            this.chart.destroy();
            this.chart = undefined;
        }
        if (this.chart2) {
            this.chart2.destroy();
        }
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
    this.destruirGraficos();
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
