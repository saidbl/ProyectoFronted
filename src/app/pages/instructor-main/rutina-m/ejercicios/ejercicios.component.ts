import { Component, OnInit , inject} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Rutina } from '../../../../models/rutina.model';
import { EjercicioRutina } from '../../../../models/ejercicioRutina.model';
import { RutinaService } from '../../../../services/rutina.service';
import { forkJoin } from 'rxjs';
import { EjercicioRutinaService } from '../../../../services/ejerciciorutina.service';
import { EjercicioRutinaDTO } from '../../../../models/ejercicioRutinaDTO.model';

@Component({
  selector: 'app-ejercicios',
  standalone: true,
  imports: [MatButtonModule, MatToolbarModule, MatCardModule, MatIconModule, MatInputModule,
      MatFormFieldModule, MatTableModule, MatPaginatorModule, MatSortModule, MatDialogModule,
      MatSnackBarModule, MatSidenavModule, MatListModule, MatSelectModule, MatTabsModule,
      MatDatepickerModule, MatNativeDateModule, FormsModule,CommonModule,RouterModule],
  templateUrl: './ejercicios.component.html',
  styleUrl: './ejercicios.component.css'
}) 
export class EjerciciosComponent implements OnInit{
  private rservice = inject(RutinaService)
  private eservice = inject(EjercicioRutinaService)
  nombre : string = ''
  descripcion : string = ''
  rutina : Rutina|null = null
  rutinas : Rutina []=[]
  series : number = 0
  repeticiones:string = ''
  descanso : string = ''
  ejercicios : EjercicioRutina[] = []
  orden :  number = 0
  ngOnInit(): void {
    try{
      const token=localStorage.getItem("token")
      const id = Number(localStorage.getItem("id"))
      const idDeporte = Number(localStorage.getItem("idDeporte"))
      console.log(localStorage)
      console.log(idDeporte)
      if(!token) {
        throw new Error("Not Token Found")
      }
      forkJoin({
              rutinas: this.rservice.list(id, token),
              ejercicios: this.eservice.obtenerEjercicios(token,id),
            }).subscribe({
              next: (data) => {
                this.rutinas = data.rutinas;
                this.ejercicios = data.ejercicios
                console.log(this.rutinas)
                console.log(this.ejercicios)
              },
              error: (err) => {
                console.error("Error loading data", err);
              }
            });
    }catch(error:any){
      alert(error.message)
    }
  }

  agregarEjercicio(){
    const token=localStorage.getItem("token")
            if(!token) {
              throw new Error("Not Token Found")
            }
            const nuevaRutina: EjercicioRutinaDTO = {
              nombre: this.nombre,
              idrutina: this.rutina?.id,
              descripcion:this.descripcion,
              series: this.series,
              repeticiones: this.repeticiones,
              descanso : this.descanso,
              orden : this.orden,
            };
            this.eservice.add(nuevaRutina, token).subscribe({
              next:(data)=>{
                alert("Ejercicio agregado correctamente");
              },
              error:(err)=>{
                console.error("Error al agregar equipo", err);
              }
            })
  }

  editarEjercicio(ejercicio : EjercicioRutina){

  }

  eliminarEjercicio(ejercicio : EjercicioRutina){
    const token=localStorage.getItem("token")
    if(!token) {
      throw new Error("Not Token Found")
    }
    if(confirm("Deseas Eliminar la ejercicio: "+ejercicio.id)){
      this.eservice.delete(ejercicio.id, token).subscribe({
        next:(data)=>{
          this.ejercicios = this.ejercicios.filter(e => e !== ejercicio);
          if(data.success){
            console.log("eliminado")
          }else{
            alert("No se pudo eliminar")
          }
        },
        error:(err)=>{
          if (err.status === 0) {
            console.error('No se pudo conectar con el servidor. Por favor, verifica tu conexión a Internet.');
          } else {
            console.error('Error al eliminar la persona', err);
          }
        }
      })
    }
  }
}
