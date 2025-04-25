import { Component, OnInit , inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EventoDTO } from '../../../models/eventoDTO.model';
import { RouterModule } from '@angular/router'; 
import { EventoService } from '../../../services/evento.service';
@Component({
    selector: 'app-crear-evento',
    standalone:true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './crear-evento.component.html',
    styleUrl: './crear-evento.component.css'
})
export class CrearEventoComponent implements OnInit {
  private eservice = inject (EventoService)
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
  archivo?: File;
  showUserDropdown: boolean = false;
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


  constructor() { }
  ngOnInit(): void {
    const id = localStorage.getItem("id")
    const token = localStorage.getItem("token")
  }

  toggleDiaSeleccionado(dia: string): void {
    const index = this.diasSemana.indexOf(dia);
    if (index > -1) {
      this.diasSemana.splice(index, 1);
    } else {
      this.diasSemana.push(dia);
    }
  }


  onSubmit(): void {
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
          alert("Agregado Correctamente")
        },
        error:(err)=>{
          console.error(err)
        }
      })
    }
    
  }
  seleccionarArchivo(event: any) {
    this.archivo = event.target.files[0];
  }
  logout(){

  }
}
