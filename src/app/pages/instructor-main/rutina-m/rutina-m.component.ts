import { Component, inject, OnInit} from '@angular/core';
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
import { FormsModule } from '@angular/forms';
import { Rutina } from '../../../models/rutina.model';
import { RutinaService } from '../../../services/rutina.service';
import { CommonModule } from '@angular/common';
import { Posicion } from '../../../models/posicion.model';
import { PosicionService } from '../../../services/posicion.service';
import { RouterModule } from '@angular/router';
import { RutinaDTO } from '../../../models/rutinaDTO.model';

@Component({
    selector: 'app-rutina-m',
    standalone:true,
    imports: [MatButtonModule, MatToolbarModule, MatCardModule, MatIconModule, MatInputModule,
        MatFormFieldModule, MatTableModule, MatPaginatorModule, MatSortModule, MatDialogModule,
        MatSnackBarModule, MatSidenavModule, MatListModule, MatSelectModule, MatTabsModule,
        MatDatepickerModule, MatNativeDateModule, FormsModule, CommonModule, RouterModule],
    templateUrl: './rutina-m.component.html',
    styleUrl: './rutina-m.component.css'
})
export class RutinaMComponent implements OnInit{
  private rservice= inject(RutinaService)
  private pservice= inject(PosicionService)
  public rutinas:Rutina []= []
  public descripcion:string = ""
  public posiciones:Posicion[]=[]
  public idInstructor: number = 0
  public posicion: Posicion | null = null;
  public dia : string = ""
  public nombre : string = ""
  public nivelDificultad : string = ""
  public objetivo : string = ""
  public duracion : number = 0
  public modoEdicion: boolean = false;
  public dias:string[]=["Lunes","Martes","Miercoles","Jueves","Viernes","Sabado","Domingo"]
  public dificultades:string[]=["Basico","Intermedio","Avanzado"]
  public objetivos : string[] = ["FUERZA","RESISTENCIA","VELOCIDAD","FLEXIBIDAD","TECNICA"]
  ngOnInit(): void {
    try{
      const token=localStorage.getItem("token")
      const id = Number(localStorage.getItem("id"))
      const idDeporte = Number(localStorage.getItem("idDeporte"))
      console.log(localStorage)
      this.idInstructor= Number(localStorage.getItem("id"))
      console.log(idDeporte)
      if(!token) {
        throw new Error("Not Token Found")
      }
      this.rservice.list(id,token).subscribe({
        next:(data)=>{
          console.log(data)
          if(data.length>=0){
            console.log(data)
          this.rutinas=data
          }
        },
        error:(err)=>{
          console.log(err)
        }
      })
      this.pservice.list(idDeporte,token).subscribe({
        next:(data)=>{
          console.log(data)
          if(data.length>=0){
            console.log(data)
          this.posiciones=data
          }
        },
        error:(err)=>{
          console.log(err)
        }
      })
    }catch(error:any){
      alert(error.message)
    }
  }
  agregarRutina(){
    const token=localStorage.getItem("token")
    if(!token) {
      throw new Error("Not Token Found")
    }
    console.log(this.objetivo)
    const nuevaRutina: RutinaDTO = {
      nombre: this.nombre,
      dia: this.dia,
      idInstructor: this.idInstructor,
      idPosicion: this.posicion?.id ?? 0,
      descripcion: this.descripcion,
      nivel_dificultad : this.nivelDificultad,
      duracion_esperada : this.duracion,
      objetivo : this.objetivo
    };
    this.rservice.add(nuevaRutina, token).subscribe({
      next:(data)=>{
        alert("Rutina agregada correctamente");
      },
      error:(err)=>{
        console.error("Error al agregar rutina", err);
      }
    })

  }
  editarRutina(rutina: Rutina){

  }
  eliminarRutina(rutina: Rutina){
    const token=localStorage.getItem("token")
    if(!token) {
      throw new Error("Not Token Found")
    }
    if(confirm("Deseas Eliminar la rutina: "+rutina.id)){
      this.rservice.delete(rutina.id, token).subscribe({
        next:(data)=>{
          this.rutinas = this.rutinas.filter(r => r !== rutina);
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