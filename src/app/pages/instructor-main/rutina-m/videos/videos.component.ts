import { Component, OnInit , inject} from '@angular/core';
import { RecursoRutina } from '../../../../models/recursoRutina.model';
import { RecursoService } from '../../../../services/recurso.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EjercicioRutinaService } from '../../../../services/ejerciciorutina.service';
import { EjercicioRutina } from '../../../../models/ejercicioRutina.model';
@Component({
    selector: 'app-videos',
    standalone:true,
    imports: [FormsModule, CommonModule, RouterModule],
    templateUrl: './videos.component.html',
    styleUrl: './videos.component.css'
})
export class VideosComponent implements OnInit{
  private recursoService = inject(RecursoService)
  private eService = inject(EjercicioRutinaService)
  videos: any[] = [];
    videoFile: File | null = null;
    ejercicioId = 5;
    recursos: RecursoRutina[] = [];
    archivo?: File;
    descripcion = '';
    loading = false
    ejercicios : EjercicioRutina[] = []
  ngOnInit(): void {
    try {
      const token=localStorage.getItem("token")
      const id = Number(localStorage.getItem("id"))
      if(!token) {
        throw new Error("Not Token Found")
      }
    this.recursoService.obtenerTodosRecursos( id ,token).subscribe({
      next:(data)=>{
        console.log(data)
        this.recursos=data
      },
      error:(err)=>{
        console.log(err)
      }
    })
    this.eService.obtenerEjercicios( token, id).subscribe({
      next:(data)=>{
        console.log(data)
        this.ejercicios=data
        console.log(data)
      },
      error:(err)=>{
        console.log(err)
      }
    })
  }catch(error:any){
    alert(error.message)
  }
  }
  seleccionarArchivo(event: any) {
    this.archivo = event.target.files[0];
  }

  subirRecurso() {
    const token=localStorage.getItem("token")
    if(!token) {
      throw new Error("Not Token Found")
    }
    if (this.archivo) {
      this.recursoService.subirRecurso(this.ejercicioId, this.archivo, token, this.descripcion)
        .subscribe();
    }
  }
  eliminarRecurso(id: number) {
    
  }
}
