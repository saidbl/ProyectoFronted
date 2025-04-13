import { Component, OnInit , inject} from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { RouterModule } from '@angular/router'; 
import { RutinaService } from '../../services/rutina.service';
import { Rutina } from '../../models/rutina.model';

@Component({
  selector: 'app-instructor-main',
  standalone: true,
  imports: [MatButtonModule, MatToolbarModule, MatCardModule, MatIconModule, MatInputModule,
    MatFormFieldModule, MatTableModule, MatPaginatorModule, MatSortModule, MatDialogModule,
    MatSnackBarModule, MatSidenavModule, MatListModule, MatSelectModule, MatTabsModule,
    MatDatepickerModule, MatNativeDateModule, FormsModule, RouterModule, CommonModule],
  templateUrl: './instructor-main.component.html',
  styleUrl: './instructor-main.component.css'
})
export class InstructorMainComponent implements OnInit {
  private rservice= inject(RutinaService)
  totalRutinas:number = 0
  rutinas : Rutina[] = []
  ngOnInit(): void {
    try{
      const token=localStorage.getItem("token")
      const instructorId = Number(localStorage.getItem("id"))
      console.log(localStorage)
      if(!token) {
        throw new Error("Not Token Found")
      }
      this.rservice.getTotalRutinasByInstructorId(instructorId,token).subscribe({
        next:(data)=>{
          console.log(data)
          if(data>=0){
          console.log(data)
          this.totalRutinas=data
          }
        },
        error:(err)=>{
          console.log(err)
        }
      })
      this.rservice.getTop3RutinasByInstructor(instructorId,token).subscribe({
        next:(data:Rutina [])=>{
          this.rutinas = data
        },
        error:(err)=>{
          console.log(err)
        }
      })
    }catch(error:any){
      alert(error.message)
    }
    
  }

  cargarDeportistas() {
  }

  cargarEquipos() {
  }

  cargarEventos() {
  }

  cargarRutinas() {
  }

  cargarHistorialInscripciones() {
  }

  agregarRutina() {
  }

  asignarDeportista() {
  }

  inscribirEquipo() {
  }

  editarEquipo(id: number) {
  }

  eliminarEquipo(id: number) {
  }

  eliminarRutina(id: number) {
  }

  editarDeportista(id: number) {
  }

  eliminarDeportista(id: number) {
  }

  inscribirEquipoEvento(eventoId: number) {
  }
  
}

