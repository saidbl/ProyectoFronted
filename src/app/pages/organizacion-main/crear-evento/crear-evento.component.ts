import { Component, OnInit , inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EventoDTO } from '../../../models/eventoDTO.model';
import { Router, RouterModule } from '@angular/router'; 
import { EventoService } from '../../../services/evento.service';
import { MatIcon } from '@angular/material/icon';
import Swal from 'sweetalert2';
import { OrganizacionService } from '../../../services/organizacion.service';
@Component({
    selector: 'app-crear-evento',
    standalone:true,
    imports: [CommonModule, FormsModule, RouterModule, MatIcon],
    templateUrl: './crear-evento.component.html',
    styleUrl: './crear-evento.component.css'
})
export class CrearEventoComponent implements OnInit {
  private eservice = inject (EventoService)
  private oservice = inject(OrganizacionService)
  submitted: boolean = false;
  nombre: string = '';
  ubicacion: string = '';
  descripcion: string = '';
  numMaxEquipos:number =0
  recurrente: boolean = false;
  fechaInicio: string = '';
  fechaFin: string = '';
  correo:string = "";
  horaInicio: string = '09:00:00';
  horaFin: string = '18:00';
  frecuencia: string = 'SEMANAL';
  diasSemana: string[] = ['L', 'M', 'X', 'J', 'V'];
  nombre_organizacion: string = ""
  showUserDropdown: boolean = false;
  fotoPerfil: string = "http://localhost:8080/";
  navigation = [
  { name: 'Principal', route: '..', icon: 'home' },
  { name: 'Eventos', route: '../eventos', icon: 'event' },
  { name: 'Equipos', route: '../equipos-org', icon: 'groups' },
  { name: 'Estadisticas', route: '../estadistica-org', icon: 'analytics' },
  { name: 'Instructores', route: '../instructor', icon: 'fitness_center' }
];
  diasDisponibles: any[] = [
    { value: 'L', label: 'Lunes' },
    { value: 'M', label: 'Martes' },
    { value: 'X', label: 'Miércoles' },
    { value: 'J', label: 'Jueves' },
    { value: 'V', label: 'Viernes' },
    { value: 'S', label: 'Sábado' },
    { value: 'D', label: 'Domingo' }
  ];
  excluirFines: boolean = true;
  archivo?: File | null = null;
imagenPreview: string | null = null;




  constructor(public router :Router) { }
  ngOnInit(): void {
    const id = localStorage.getItem("id")
    const token = localStorage.getItem("token")
    if (!this.isAuthenticated()) {
      this.showAuthError();
    }
    this.loadUserData()
  }
  loadUserData(): void {
    const nombre = localStorage.getItem('nombre');
    const fotoPerfil = localStorage.getItem('fotoPerfil');
    
    this.nombre_organizacion = nombre || '';
    this.fotoPerfil = fotoPerfil ? `http://localhost:8080/${fotoPerfil}` : this.fotoPerfil;
  }
  private isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }
  private showAuthError(): void {
    Swal.fire({
      title: 'Sesión expirada',
      text: 'Por favor inicie sesión nuevamente',
      icon: 'error',
      confirmButtonText: 'Ir a login'
    }).then(() => {
      this.router.navigate(['/login']);
    });
  }

  toggleDiaSeleccionado(dia: string): void {
    const index = this.diasSemana.indexOf(dia);
    if (index > -1) {
      this.diasSemana.splice(index, 1);
    } else {
      this.diasSemana.push(dia);
    }
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
        this.oservice.logOut();
        this.router.navigate(['/login']);
        Swal.fire('Sesión cerrada', '', 'success');
      }
    });
    }

    verificarEntero(valor:any){
      const entero = Math.floor(valor)
      this.numMaxEquipos= entero
    }

validarFormulario(): boolean {
  this.submitted = true;
  const fechaActual = new Date();
  const fechaMinima = new Date();
  fechaMinima.setDate(fechaActual.getDate() + 7); 
  if (!this.nombre.trim()) {
    Swal.fire('Error', 'El nombre es obligatorio.', 'error');
    return false;
  }

  if (!this.ubicacion.trim()) {
    Swal.fire('Error', 'La ubicación es obligatoria.', 'error');
    return false;
  }

  if (!this.descripcion.trim()) {
    Swal.fire('Error', 'La descripción es obligatoria.', 'error');
    return false;
  }

  if (this.numMaxEquipos <= 0) {
    Swal.fire('Error', 'El número máximo de equipos debe ser mayor que 0.', 'error');
    return false;
  }
  if (!Number.isInteger(this.numMaxEquipos) || this.numMaxEquipos <= 1) {
  Swal.fire('Error', 'El número máximo de equipos debe ser un número entero mayor a 1 (sin decimales ni comas).', 'error');
  return false;
}

  if (!this.fechaInicio) {
    Swal.fire('Error', 'La fecha de inicio es obligatoria.', 'error');
    return false;
  }

  const fechaInicio = new Date(this.fechaInicio);
  if (fechaInicio < fechaMinima) {
    Swal.fire('Error', 'La fecha de inicio debe ser al menos 7 días después de hoy.', 'error');
    return false;
  }

  if (!this.correo.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)) {
    Swal.fire('Error', 'El correo electrónico no es válido.', 'error');
    return false;
  }
  if (this.recurrente) {
    if (!this.fechaFin) {
      Swal.fire('Error', 'La fecha de fin es obligatoria para eventos recurrentes.', 'error');
      return false;
    }
let fechaFin = new Date(this.fechaFin);

if (fechaInicio > fechaFin) {
  Swal.fire('Error', 'La fecha de inicio no puede ser posterior a la fecha de fin.', 'error');
  return false;
}

const diferenciaMs = fechaFin.getTime() - fechaInicio.getTime();

const diferenciaDias = diferenciaMs / (1000 * 60 * 60 * 24);

if (diferenciaDias < 8) {
  Swal.fire('Error', 'La fecha de fin debe ser al menos 8 días después de la fecha de inicio.', 'error');
  return false;
}
    if (this.diasSemana.length === 0) {
      Swal.fire('Error', 'Debes seleccionar al menos un día de la semana para eventos recurrentes.', 'error');
      return false;
    }
  }
  const [horaI, minutoI] = this.horaInicio.split(':').map(Number);
    const [horaF, minutoF] = this.horaFin.split(':').map(Number);

    const inicio = new Date();
    inicio.setHours(horaI, minutoI, 0, 0);

    const fin = new Date();
    fin.setHours(horaF, minutoF, 0, 0);

    const diferenciaHoras = (fin.getTime() - inicio.getTime()) / (1000 * 60 * 60);

    if (diferenciaHoras < 2) {
      Swal.fire('Error', 'La hora de término debe ser al menos 2 horas después de la hora de inicio.', 'error');
      return false;
    }

  return true;
}

  onSubmit(): void {
    if (!this.isAuthenticated()) {
      this.showAuthError();
      return;
    }

    if (!this.validarFormulario()) {
      return;
    }
    const id = localStorage.getItem("id")
    const token = localStorage.getItem("token")
    if(!token) {
      throw new Error("Not Token Found")
    }
    const nuevoEvento: EventoDTO = {
              nombre: this.nombre,
              idOrganizacion : Number(localStorage.getItem("id")),
              idDeporte : Number(localStorage.getItem("idDeporte")),
              numMaxEquipos : this.numMaxEquipos,
              fecha : new Date(this.fechaInicio),
              fechaFin: new Date(this.fechaFin),
              descripcion: this.descripcion,
              ubicacion: this.ubicacion,
              horaInicio: this.horaInicio,
              horaFin: this.horaFin,
              estado: "PLANIFICADO",
              contactoOrganizador:this.correo,
              recurrente:this.recurrente,
              frecuencia:this.frecuencia,
              diasSemana:this.diasSemana,
              excluirFines:this.excluirFines,
              fechas: [],
              equiposInscritos:0,
              imagen:"",
              esFuturo:true
            };
      if(this.archivo){
      this.eservice.addEvento(nuevoEvento,token, this.archivo).subscribe({
        next:(data)=>{
          Swal.fire({
          title: '¡Éxito!',
          text: 'Evento creado correctamente',
          icon: 'success',
          confirmButtonText: 'Aceptar'
        }).then((result) => {
          if (result.isConfirmed) {
            this.resetForm();
          }
        });

        },
        error:(err)=>{
        console.error(err);
        
        Swal.fire({
          title: 'Error',
          text: 'Ocurrió un error al crear el evento: ' + (err.error?.message || ''),
          icon: 'error',
          confirmButtonText: 'Entendido'
        });
        }
      })
    }else{
      Swal.fire({
          title: 'Error',
          text: 'Imagen Obligatoria',
          icon: 'error',
          confirmButtonText: 'Entendido'
        });
    }
    
  }
  seleccionarArchivo(event: any): void {
    const input = event.target as HTMLInputElement;
  if (!input.files || input.files.length === 0) {
    return;
  }
  const file = input.files[0];
  if (!file.type.startsWith('image/')) {
    alert('Solo se permiten archivos de imagen.');
    return;
  }
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    alert('El archivo excede el tamaño máximo permitido de 5MB.');
    return;
  }

  this.archivo = file;
  const reader = new FileReader();
  reader.onload = () => {
    this.imagenPreview = reader.result as string;
  };
  reader.readAsDataURL(file);
  }

  resetForm(): void {
    this.nombre = '';
    this.ubicacion = '';
    this.descripcion = '';
    this.numMaxEquipos = 0;
    this.recurrente = false;
    this.fechaInicio = '';
    this.fechaFin = '';
    this.correo = '';
    this.horaInicio = '09:00:00';
    this.horaFin = '18:00';
    this.frecuencia = 'SEMANAL';
    this.diasSemana = ['L', 'M', 'X', 'J', 'V'];
    this.archivo = undefined;
    this.imagenPreview = null
    this.submitted = false;
  }
  logout(){

  }
   toggleUserDropdown() {
  this.showUserDropdown = !this.showUserDropdown;
}
}
