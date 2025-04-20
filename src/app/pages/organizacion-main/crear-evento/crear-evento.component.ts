import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Evento } from '../../../models/evento.model';
import { FormsModule } from '@angular/forms';
import { EventoDTO } from '../../../models/eventoDTO.model';
import { LocalTime } from '../../../models/LocalTime';
@Component({
  selector: 'app-crear-evento',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './crear-evento.component.html',
  styleUrl: './crear-evento.component.css'
})
export class CrearEventoComponent implements OnInit {

  nombre: string = '';
  ubicacion: string = '';
  descripcion: string = '';
  numMaxEquipos:number =0
  // Configuración de fechas
  recurrente: boolean = false;
  fechaInicio: string = '';
  fechaFin: string = '';
  correo:string = "";
  horaInicio: string = '09:00:00';
  horaFin: string = '18:00';
  frecuencia: string = 'SEMANAL';
  diasSemana: string[] = ['L', 'M', 'X', 'J', 'V'];
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

  // Vista previa de fechas generadas
  fechasGeneradas: any[] = [];

  constructor() { }
  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }

  toggleDiaSeleccionado(dia: string): void {
    const index = this.diasSemana.indexOf(dia);
    if (index > -1) {
      this.diasSemana.splice(index, 1);
    } else {
      this.diasSemana.push(dia);
    }
    this.actualizarVistaPrevia();
  }

  actualizarVistaPrevia(): void {
    if (this.recurrente) {
      // Lógica para generar vista previa de fechas recurrentes
      this.fechasGeneradas = this.generarEjemploFechas();
    } else {
      // Mostrar solo la fecha única
      this.fechasGeneradas = [{
        fecha: this.fechaInicio,
        horaInicio: this.horaInicio,
        horaFin: this.horaFin
      }];
    }
  }

  private generarEjemploFechas(): any[] {
    // Esto es solo para demostración - implementa tu lógica real aquí
    const ejemploFechas = [];
    const fecha = new Date(this.fechaInicio);
    
    for (let i = 0; i < 5; i++) {
      fecha.setDate(fecha.getDate() + (i === 0 ? 0 : 7)); // Semanal
      ejemploFechas.push({
        fecha: fecha.toISOString().split('T')[0],
        horaInicio: this.horaInicio,
        horaFin: this.horaFin
      });
    }
    
    return ejemploFechas;
  }

  onSubmit(): void {
    const nuevoEvento: EventoDTO = {
              nombre: this.nombre,
              idOrganizacion : Number(localStorage.getItem("id")),
              idDeporte : Number(localStorage.getItem("idDeporte")),
              numMaxEquipos : this.numMaxEquipos,
              fecha : new Date(this.fechaInicio),
              fechaFin: new Date(this.fechaFin),
              descripcion: this.descripcion,
              ubicacion: this.ubicacion,
              horaInicio: LocalTime.fromString(this.horaInicio),
              horaFin: LocalTime.fromString(this.horaFin),
              estado: "Planificado",
              contactoOrganizador:this.correo,
              recurrente:this.recurrente,
              frecuencia:this.frecuencia,
              diasSemana:this.diasSemana,
              excluirFines:this.excluirFines,
              fechas: [],
              equiposInscritos:0,

            };
    // Aquí llamarías a tu servicio para guardar el evento
  }
}
