import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DateAdapter } from '@angular/material/core';
import { EventoService } from '../../../../services/evento.service';
import { Evento} from '../../../../models/evento.model';
import { Organizacion } from '../../../../models/organizacion.model';
import { Deporte } from '../../../../models/deporte.model';
import { LocalTime } from '../../../../models/LocalTime';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatNativeDateModule } from '@angular/material/core';
import { EventoDTO } from '../../../../models/eventoDTO.model';

interface EventoForm {
  nombre: FormControl<string | null>;
  organizador: FormControl<Organizacion|null>
  deporte: FormControl<Deporte | null>;
  numMaxEquipos: FormControl<number | null>;
  fecha: FormControl<Date | null>;
  fechaFin: FormControl<Date | null>;
  equiposInscritos : FormControl<number|null>
  descripcion: FormControl<string | null>;
  ubicacion: FormControl<string | null>;
  horaInicio: FormControl<string | null>;
  horaFin: FormControl<string | null>;
  estado: FormControl<string | null>;
  contactoOrganizador: FormControl<string | null>;
  recurrente: FormControl<boolean | null>;
  frecuencia: FormControl<string | null>;
  diasSemana: FormControl<string[] | null>;
  excluirFines: FormControl<boolean | null>;
  imagen: FormControl<string | null>;

}

@Component({
    selector: 'app-evento-editar',
    templateUrl: './evento-editar.component.html',
    styleUrls: ['./evento-editar.component.css'],
    imports: [ReactiveFormsModule, CommonModule, MatNativeDateModule]
})
export class EventoEditarComponent implements OnInit {
  cargando = false;
  eventoForm: FormGroup<EventoForm>;
  diasDisponibles: any[] = [
    { value: 'L', label: 'Lunes' },
    { value: 'M', label: 'Martes' },
    { value: 'X', label: 'Miércoles' },
    { value: 'J', label: 'Jueves' },
    { value: 'V', label: 'Viernes' },
    { value: 'S', label: 'Sábado' },
    { value: 'D', label: 'Domingo' }
  ];
  diasSemana: string[] = ['L', 'M', 'X', 'J', 'V'];

  constructor(
    private fb: FormBuilder,
    private dateAdapter: DateAdapter<Date>,
    public dialogRef: MatDialogRef<EventoEditarComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { evento: Evento, organizacion: Organizacion },
    private eservice: EventoService
  ) {
    this.dateAdapter.setLocale('es-ES');
    this.eventoForm = this.fb.group<EventoForm>({
      nombre: new FormControl('', Validators.required),
      organizador : new FormControl(null),
      deporte: new FormControl(null),
      numMaxEquipos: new FormControl(null, [Validators.required, Validators.min(1)]),
      fecha: new FormControl(null, Validators.required),
      fechaFin: new FormControl(null),
      equiposInscritos:new FormControl(null,Validators.required),
      descripcion: new FormControl('', Validators.required),
      ubicacion: new FormControl('', Validators.required),
      horaInicio: new FormControl(null, Validators.required),
      horaFin: new FormControl(null, Validators.required),
      estado: new FormControl('PLANIFICADO', Validators.required),
      contactoOrganizador: new FormControl('', Validators.required),
      recurrente: new FormControl(false),
      frecuencia: new FormControl(''),
      diasSemana: new FormControl([]),
      excluirFines: new FormControl(false),
      imagen: new FormControl('')
    });
  }

  ngOnInit(): void {
    this.cargarDatosIniciales();
  }

  cargarDatosIniciales(): void {
    if (this.data.evento) {
      const evento = this.data.evento;
      const diasSemana = evento.diasSemana || [];
      this.eventoForm.patchValue({
        nombre: evento.nombre,
        numMaxEquipos: evento.numMaxEquipos,
        fecha: evento.fecha,
        fechaFin: evento.fechaFin || null,
        equiposInscritos : evento.equiposInscritos,
        descripcion: evento.descripcion,
        ubicacion: evento.ubicacion,
        horaInicio: evento.horaInicio.toString(),
        horaFin: evento.horaFin.toString(),
        estado: evento.estado,
        contactoOrganizador: evento.contactoOrganizador,
        recurrente: evento.recurrente || false,
        frecuencia: evento.frecuencia || '',
        diasSemana: diasSemana,
        excluirFines: evento.excluirFines  || false,
      }); 
      this.diasSemana = [...diasSemana];
    }
  }

  toggleDiaSeleccionado(dia: string): void {
    try {
      let currentDias = this.eventoForm.get('diasSemana')?.value;
      if (!Array.isArray(currentDias)) {
        currentDias = [];
      }
      const newDias = [...currentDias];
      const index = newDias.indexOf(dia);
  
      if (index > -1) {
        newDias.splice(index, 1);
      } else {
        newDias.push(dia);
      }
      this.eventoForm.get('diasSemana')?.setValue(newDias);
      console.log(this.eventoForm.get('diasSemana'))
      this.diasSemana = newDias;
    } catch (error) {
      console.error('Error en toggleDiaSeleccionado:', error);
    }
  }
  onSubmit(): void {
    if (this.eventoForm.valid) {
      const token = localStorage.getItem("token")
      if(!token) {
        throw new Error("Not Token Found")
      }
      this.cargando = true;
      const formValue = this.eventoForm.value;
      console.log(formValue.diasSemana)
      const eventoActualizado: EventoDTO = {
        ...this.data.evento,
        nombre: formValue.nombre || '',
        idOrganizacion : this.data.evento.organizacion.id,
        idDeporte: this.data.evento.deporte.id,
        numMaxEquipos: formValue.numMaxEquipos || 0,
        fecha: formValue.fecha || new Date(),
        fechaFin: formValue.fechaFin || new Date(),
        descripcion: formValue.descripcion || '',
        ubicacion: formValue.ubicacion || '',
        horaInicio: formValue.horaInicio || "",
        horaFin: formValue.horaFin || "",
        estado: formValue.estado || 'PLANIFICADO',
        contactoOrganizador: formValue.contactoOrganizador || '',
        recurrente: formValue.recurrente || false,
        frecuencia: formValue.frecuencia || '',
        diasSemana: formValue.diasSemana || [],
        excluirFines: formValue.excluirFines ? true : false,
        fechas : [],
        equiposInscritos : 0,
        imagen : "",
        esFuturo:true
      };
      console.log(eventoActualizado)
      this.eservice.actualizarEvento(this.data.evento.id,eventoActualizado,token).subscribe({
        next: () => {
          this.dialogRef.close('actualizado');
        },
        error: (error) => {
          console.error('Error al actualizar evento', error);
          this.cargando = false;
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

}