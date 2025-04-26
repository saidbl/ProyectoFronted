import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
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
import { FormsModule } from '@angular/forms';

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
    imports: [ReactiveFormsModule, CommonModule, MatNativeDateModule,FormsModule]
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
  minDate: Date;

  constructor(
    private fb: FormBuilder,
    private dateAdapter: DateAdapter<Date>,
    public dialogRef: MatDialogRef<EventoEditarComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { evento: Evento, organizacion: Organizacion },
    private eservice: EventoService
  ) {
    const today = new Date();
    this.minDate = new Date(today.setDate(today.getDate() + 7));
    this.dateAdapter.setLocale('es-ES');
    this.eventoForm = this.fb.group<EventoForm>({
      nombre: new FormControl('', {
        validators:[
        Validators.required,
        Validators.maxLength(100),
        this.noSqlInjectionValidator
    ]}),

      organizador : new FormControl(null),
      deporte: new FormControl(null),
      numMaxEquipos: new FormControl(null, {
        validators:[
        Validators.required, 
        Validators.min(1),
        Validators.max(100)
      ]}),
      fecha:  new FormControl(null, {
        validators:[Validators.required,this.futureDateValidator]
      }),
      fechaFin: new FormControl(null, [
        this.validarFechaValida(),
        this.validarFechaFin.bind(this)
      ]),
      equiposInscritos:new FormControl(null,Validators.required),
      descripcion: new FormControl('', [
        Validators.required,
        Validators.maxLength(500),
        this.noSqlInjectionValidator
      ]),
      ubicacion:  new FormControl('', {
        validators:[
        Validators.required,
        Validators.maxLength(200),
        this.noSqlInjectionValidator
      ]}),
      horaInicio: new FormControl(null, Validators.required),
      horaFin: new FormControl(null, [
        Validators.required
      ]),
      estado: new FormControl('PLANIFICADO', Validators.required),
      contactoOrganizador:  new FormControl('',{
        validators: [
        Validators.required,
        Validators.maxLength(100),
        this.noSqlInjectionValidator
      ]}),
      recurrente: new FormControl(false),
      frecuencia: new FormControl(''),
      diasSemana: new FormControl([]),
      excluirFines: new FormControl(false),
      imagen: new FormControl('')
    });
    this.eventoForm.get('fecha')?.valueChanges.subscribe(() => {
      this.eventoForm.get('fechaFin')?.updateValueAndValidity();
    });
  }

  ngOnInit(): void {
    this.cargarDatosIniciales();
  }
  futureDateValidator(control: FormControl): { [key: string]: any } | null {
    const selectedDate = new Date(control.value);
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 7);
    
    return selectedDate < minDate ? { minDate: true } : null;
  }
  validarFechaValida(): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} | null => {
      const fecha = control.value;
      if (!fecha) return null; // Permitir campo vacío si no es requerido
      
      const esFechaValida = !isNaN(new Date(fecha).getTime());
      return esFechaValida ? null : { fechaInvalida: true };
    };
  }
  
  validarFechaFin(control: AbstractControl): {[key: string]: any} | null {
    if (!control.value) return null; 
    
    const fechaFin = new Date(control.value);
    const fechaInicio = this.eventoForm?.get('fecha')?.value;
    if (isNaN(fechaFin.getTime())) {
      return { fechaInvalida: true };
    }
    if (fechaInicio) {
      const fechaInicioDate = new Date(fechaInicio);
      fechaFin.setHours(0, 0, 0, 0);
      fechaInicioDate.setHours(0, 0, 0, 0);
      if (fechaFin < fechaInicioDate) {
        return { fechaFinAnterior: true };
      }
    }
    
    return null;
  }
  

  noSqlInjectionValidator(control: FormControl): { [key: string]: any } | null {
    const value = control.value;
    if (!value) return null;
    
    const sqlKeywords = [
      'select', 'insert', 'update', 'delete', 'drop', 
      'truncate', '--', ';', '/*', '*/', 'xp_'
    ];
    
    const containsSql = sqlKeywords.some(keyword => 
      value.toLowerCase().includes(keyword)
    );
    
    return containsSql ? { sqlInjection: true } : null;
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
  getErrorMessage(controlName: string): string {
    const control = this.eventoForm.get(controlName);
    
    if (control?.hasError('required')) {
      return 'Este campo es obligatorio';
    }
    
    if (control?.hasError('min')) {
      return `El valor mínimo es ${control.errors?.['min'].min}`;
    }
    
    if (control?.hasError('max')) {
      return `El valor máximo es ${control.errors?.['max'].max}`;
    }
    
    if (control?.hasError('maxLength')) {
      return `Máximo ${control.errors?.['maxLength'].requiredLength} caracteres`;
    }
    
    if (control?.hasError('sqlInjection')) {
      return 'El texto contiene caracteres no permitidos';
    }
    
    if (control?.hasError('minDate')) {
      return 'La fecha debe ser al menos una semana en el futuro';
    }
    
    if (control?.hasError('fechaFinInvalida')) {
      return 'La fecha final no puede ser anterior a la fecha de inicio';
    }
    if (control?.hasError('fechaInvalida')) {
      return 'Por favor ingrese una fecha válida';
    }
    
    if (control?.hasError('fechaFinAnterior')) {
      return 'La fecha final no puede ser anterior a la fecha de inicio';
    }
    if (control?.hasError('horaInvalida')) {
      return 'Por favor ingrese una hora válida en formato HH:MM';
    }
    
    if (control?.hasError('horaFinAnterior')) {
      return 'La hora final debe ser posterior a la hora de inicio';
    }
    
    return '';
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