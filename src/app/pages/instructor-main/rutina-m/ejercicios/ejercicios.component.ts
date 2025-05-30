import { Component, OnInit , inject} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Rutina } from '../../../../models/rutina.model';
import { EjercicioRutina } from '../../../../models/ejercicioRutina.model';
import { RutinaService } from '../../../../services/rutina.service';
import { forkJoin } from 'rxjs';
import { EjercicioRutinaService } from '../../../../services/ejerciciorutina.service';
import { EjercicioRutinaDTO } from '../../../../models/ejercicioRutinaDTO.model';
import Swal from 'sweetalert2';
import { MatIcon } from '@angular/material/icon';
import { InstructorService } from '../../../../services/instructor.service';
@Component({
    selector: 'app-ejercicios',
    standalone:true,
    imports: [ FormsModule, CommonModule, RouterModule,MatIcon ],
    templateUrl: './ejercicios.component.html',
    styleUrl: './ejercicios.component.css'
}) 
export class EjerciciosComponent implements OnInit{
  private rservice = inject(RutinaService)
  private eservice = inject(EjercicioRutinaService)
  private iservice = inject(InstructorService)
  nombre : string = ''
  nombreInst: string = '';
  apellido: string = '';
  fotoPerfil: string = "http://localhost:8080/";
  showNotification: boolean = false;
  notificationMessage: string = '';
  showUserDropdown: boolean = false;
  id :number = 0
  descripcion : string = ''
  rutina : Rutina|null = null
  rutinas : Rutina []=[]
  series : number = 0
  repeticiones:string = ''
  descanso : string = ''
  ejercicios : EjercicioRutina[] = []
  modoEdicion:boolean = false
  orden :  number = 0
  constructor(public router:Router){}
  ngOnInit(): void {
    try{
      const fotoPerfil = localStorage.getItem("fotoPerfil")
      const nom=localStorage.getItem("nombre")
      const ap = localStorage.getItem("apellido")
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
                this.fotoPerfil = this.fotoPerfil+ fotoPerfil
                this.nombreInst=nom ?? ''
                this.apellido= ap ?? ''
              },
              error: (err) => {
                Swal.fire('Error', 'No se pudieron cargar los ejercicios', 'error');
              }
            });
    }catch(error:any){
      Swal.fire('Error', error.message, 'error');
    }
  }
   limpiarFormulario(): void {
    this.nombre = "";
    this.descripcion= "",
    this.series=0,
    this.repeticiones='0',
    this.descanso="",
    this.orden = 0
    this.rutina = null
    this.modoEdicion = false;
  }

  confirmarEliminarRutina(ejercicio: EjercicioRutina): void {
      Swal.fire({
        title: '¿Estás seguro?',
        text: `¿Deseas eliminar el ejercicio "${ejercicio.nombre}"?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#aaa',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          this.eliminarEjercicio(ejercicio);
        }
      });
    }
  async agregarEjercicio():Promise<void>{
    const token=localStorage.getItem("token")
            if(!token) {
                 await Swal.fire('Error', 'Token no encontrado', 'error');
                 return;
            }
            if (!this.nombre || !this.descripcion || !this.series || !this.repeticiones || !this.descanso || !this.orden ||!this.rutina) {
                await Swal.fire('Campos incompletos', 'Por favor, completa todos los campos requeridos.', 'warning');
                return;
              }
            const nuevaRutina: EjercicioRutinaDTO = {
              nombre: this.nombre,
              idrutina: this.rutina?.id?? 0,
              descripcion:this.descripcion,
              series: this.series,
              repeticiones: this.repeticiones,
              descanso : this.descanso,
              orden : this.orden,
            };
            if (!this.modoEdicion) {
            this.eservice.add(nuevaRutina, token).subscribe({
              next: async (data) => {
                      await Swal.fire('¡Éxito!', 'Ejercicio agregado correctamente', 'success');
                      this.ngOnInit();
                      this.limpiarFormulario();
                    },
                    error: async (err) => {
                      console.error(err);
                      await Swal.fire('Error', 'No se pudo agregar el Ejercicio', 'error');
                    }
            })
          }else{
            this.eservice.edit(this.id, nuevaRutina, token).subscribe({
                  next: async (data) => {
                    await Swal.fire('¡Éxito!', 'Ejercicio actualizado correctamente', 'success');
                    this.ngOnInit();
                    this.limpiarFormulario();
                  },
                  error: async (err) => {
                    console.error(err);
                    await Swal.fire('Error', 'No se pudo actualizar el ejercicio', 'error');
                  }
                });
          }
  }

  editarEjercicio(ejercicio : EjercicioRutina){
    this.modoEdicion=true
    this.nombre= ejercicio.nombre,
    this.descripcion= ejercicio.descripcion,
    this.series=ejercicio.series,
    this.repeticiones=ejercicio.repeticiones,
    this.descanso=ejercicio.descanso,
    this.orden = ejercicio.orden
    this.id = ejercicio.id
    this.rutina = this.rutinas.find(rut => rut.id === ejercicio.rutina.id) ?? null;
  }

   async  eliminarEjercicio(ejercicio : EjercicioRutina): Promise<void>{
    const token=localStorage.getItem("token")
    if(!token) {
      await Swal.fire('Error', 'Token no encontrado', 'error');
          return;
    }
      this.eservice.delete(ejercicio.id, token).subscribe({
        next: async (data) => {
              if (data.success) {
                this.ejercicios = this.ejercicios.filter(r => r.id !== ejercicio.id);
                await Swal.fire('Eliminado', 'El ejercicio fue eliminado correctamente', 'success');
              } else {
                await Swal.fire('Error', 'No se pudo eliminar el ejercicio', 'error');
              }
            },
            error: async (err) => {
              console.error(err);
              await Swal.fire('Error', 'Error al eliminar el ejercicio', 'error');
            }
      })
    }
    toggleUserDropdown() {
  this.showUserDropdown = !this.showUserDropdown;
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
    this.iservice.logOut();
    this.router.navigate(['/login']);
    Swal.fire('Sesión cerrada', '', 'success');
  }
});
}
  }
