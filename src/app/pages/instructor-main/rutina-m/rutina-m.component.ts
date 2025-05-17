import { Component, inject, OnInit} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Rutina } from '../../../models/rutina.model';
import { RutinaService } from '../../../services/rutina.service';
import { CommonModule } from '@angular/common';
import { Posicion } from '../../../models/posicion.model';
import { PosicionService } from '../../../services/posicion.service';
import { RouterModule } from '@angular/router';
import { RutinaDTO } from '../../../models/rutinaDTO.model';
import Swal from 'sweetalert2';
@Component({
    selector: 'app-rutina-m',
    standalone:true,
    imports: [FormsModule, CommonModule, RouterModule],
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
  public id : number = 0
  public modoEdicion: boolean = false;
  public dias:string[]=["Lunes","Martes","Miercoles","Jueves","Viernes","Sabado","Domingo"]
  public dificultades:string[]=["Básico","Intermedio","Avanzado"]
  public objetivos : string[] = ["FUERZA","RESISTENCIA","VELOCIDAD","FLEXIBIDAD","TECNICA"]
  mostrarConfirmacionEliminar: boolean = false;
  rutinaAEliminar: Rutina | null = null;
  showUserDropdown: boolean = false;
  nombreInstructor: string = 'Nombre Instructor';
  fotoPerfil: string = 'https://randomuser.me/api/portraits/men/32.jpg';
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
          Swal.fire('Error', 'No se pudieron cargar las rutinas', 'error');
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
           Swal.fire('Error', 'No se pudieron cargar las posiciones', 'error');
        }
      })
    }catch(error:any){
       Swal.fire('Error', error.message, 'error');
    }
  }
   limpiarFormulario(): void {
    this.nombre = "";
    this.dia = "";
    this.descripcion = "";
    this.nivelDificultad = "";
    this.duracion = 0;
    this.objetivo = "";
    this.posicion = null;
    this.modoEdicion = false;
  }
  logout(): void {
  }
  confirmarEliminarRutina(rutina: Rutina): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar la rutina "${rutina.nombre}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#aaa',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.eliminarRutina(rutina);
      }
    });
  }
  toggleUserDropdown(): void {
    this.showUserDropdown = !this.showUserDropdown;
  }
  async agregarRutina(): Promise<void> {
  const token = localStorage.getItem("token");
  if (!token) {
    await Swal.fire('Error', 'Token no encontrado', 'error');
    return;
  }

  if (!this.nombre || !this.dia || !this.nivelDificultad || !this.objetivo || !this.descripcion || !this.posicion) {
    await Swal.fire('Campos incompletos', 'Por favor, completa todos los campos requeridos.', 'warning');
    return;
  }

  const nuevaRutina: RutinaDTO = {
    nombre: this.nombre,
    dia: this.dia,
    idInstructor: this.idInstructor,
    idPosicion: this.posicion?.id ?? 0,
    descripcion: this.descripcion,
    nivel_dificultad: this.nivelDificultad,
    duracion_esperada: this.duracion,
    objetivo: this.objetivo
  };

  if (!this.modoEdicion) {
    this.rservice.add(nuevaRutina, token).subscribe({
      next: async (data) => {
        await Swal.fire('¡Éxito!', 'Rutina agregada correctamente', 'success');
        this.ngOnInit();
        this.limpiarFormulario();
      },
      error: async (err) => {
        console.error(err);
        await Swal.fire('Error', 'No se pudo agregar la rutina', 'error');
      }
    });
  } else {
    this.rservice.edit(this.id, nuevaRutina, token).subscribe({
      next: async (data) => {
        await Swal.fire('¡Éxito!', 'Rutina actualizada correctamente', 'success');
        this.ngOnInit();
        this.limpiarFormulario();
      },
      error: async (err) => {
        console.error(err);
        await Swal.fire('Error', 'No se pudo actualizar la rutina', 'error');
      }
    });
  }
}

  editarRutina(rutina: Rutina){
    this.modoEdicion=true
    this.nombre= rutina.nombre,
    this.dia= rutina.dia,
    this.descripcion= rutina.descripcion,
    this.nivelDificultad = rutina.nivel_dificultad,
    this.duracion=rutina.duracion_esperada,
    this.objetivo = rutina.objetivo
    this.id = rutina.id
    this.posicion = this.posiciones.find(pos => pos.id === rutina.posicion.id) ?? null;
  }
  async eliminarRutina(rutina: Rutina): Promise<void> {
  const token = localStorage.getItem("token");
  if (!token) {
    await Swal.fire('Error', 'Token no encontrado', 'error');
    return;
  }

  this.rservice.delete(rutina.id, token).subscribe({
    next: async (data) => {
      if (data.success) {
        this.rutinas = this.rutinas.filter(r => r.id !== rutina.id);
        await Swal.fire('Eliminado', 'La rutina fue eliminada correctamente', 'success');
      } else {
        await Swal.fire('Error', 'No se pudo eliminar la rutina', 'error');
      }
    },
    error: async (err) => {
      console.error(err);
      await Swal.fire('Error', 'Error al eliminar la rutina', 'error');
    }
  });
}

}