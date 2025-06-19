import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InstructorService } from '../../../services/instructor.service';
import { Instructor } from '../../../models/instructor.model';
import { InstructorDTO } from '../../../models/instructorDTO.model';
import { MatIcon } from '@angular/material/icon';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { Router, RouterModule } from '@angular/router';
import { OrganizacionService } from '../../../services/organizacion.service';
@Component({
  selector: 'app-instructores-control',
  imports: [ MatIcon,ReactiveFormsModule,CommonModule,RouterModule],
  templateUrl: './instructores-control.component.html',
  styleUrl: './instructores-control.component.css'
})
export class InstructoresControlComponent {
  private iservice  = inject(InstructorService)
  private oservice = inject(OrganizacionService)
  instructores: Instructor[] = [];
  mostrarModal = false;
  fotoPerfil: string = "http://localhost:8080/";
  showUserDropdown: boolean = false;
  previewImage: string | ArrayBuffer | null = null;
  instructorEditando: any = null;
  nombreO = ""
  instructorForm: FormGroup;
  navigation = [

  { name: 'Crear Eventos', route: '../crear-eventos', icon: 'add' },
  { name: 'Eventos', route: '../eventos', icon: 'event' },
  { name: 'Equipos', route: '../equipos-org', icon: 'groups' },
  { name: 'Estadisticas', route: '../estadistica-org', icon: 'analytics' },
  { name: 'Principal', route: '..', icon: 'home' }
];
  constructor(
    private fb: FormBuilder,public router: Router
  ) {
    this.instructorForm = this.fb.group({
  nombre: ['', [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,}$/)]],
  apellido: ['', [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,}$/)]],
  email: ['', [Validators.required, Validators.email]],
  password: ['', [
    Validators.required,
    Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/)
  ]],
  telefono: ['', [Validators.pattern(/^\d{10}$/)]],
  especialidad: ['', Validators.required],
  experiencia: [0, [Validators.required, Validators.min(0)]],
  rol: ['instructor'],
  idDeporte: [Number(localStorage.getItem("idDeporte"))],
  fotoPerfil: ['']
});
  }

  ngOnInit(): void {
    if (!this.isAuthenticated()) {
      this.showAuthError();
    }
    this.cargarInstructores();
    this.loadUserData()
  }
  private isAuthenticated(): boolean {
            return !!localStorage.getItem('token');
          }
          private showAuthError(): void {
            Swal.fire({
              title: 'Sesión expirada',
              text: 'Por favor inicie sesión nuevamente',
              icon: 'error',
              confirmButtonText: 'Ir a login'
            }).then(() => {
              this.router.navigate(['/login']);
            });
          }

  loadUserData(): void {
    const nombre = localStorage.getItem('nombre');
    const fotoPerfil = localStorage.getItem('fotoPerfil');
    
    this.nombreO = nombre || '';
    this.fotoPerfil = fotoPerfil ? `http://localhost:8080/${fotoPerfil}` : this.fotoPerfil;
  }
  toggleUserDropdown() {
  this.showUserDropdown = !this.showUserDropdown;
}
  cargarInstructores(): void {
    const id = Number(localStorage.getItem("id"))
    const token = localStorage.getItem("token")
    if(!token) {
      throw new Error("Not Token Found")
    }
    this.iservice.obtenerInstructores(id, token).subscribe({
      next: (data) => this.instructores = data,
      error: (err) => console.error('Error cargando instructores', err)
    });
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
        this.oservice.logOut();
        this.router.navigate(['/login']);
        Swal.fire('Sesión cerrada', '', 'success');
      }
    });
    }

  abrirModal(): void {
    this.instructorEditando = null;
    this.instructorForm.reset();
    this.mostrarModal = true;
  }
  onFileSelected(event: any): void {
    const fileInput = event.target as HTMLInputElement;
    const file: File | null = fileInput.files?.[0] || null;
    if (!file) return;
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    const maxSizeMB = 2;
    if (!allowedTypes.includes(file.type)) {
      fileInput.value = ''; 
      return;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      fileInput.value = ''; 
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      this.previewImage = reader.result;
      this.instructorForm.get('fotoPerfil')!.setValue(file);
    };
    reader.readAsDataURL(file);
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.instructorEditando = null;
  }


  guardarInstructor(): void {
    const token = localStorage.getItem("token")
    if(!token) {
      throw new Error("Not Token Found")
    }
    console.log("ID ORG:", localStorage.getItem("id"));
console.log("ID DEPORTE:", localStorage.getItem("idDeporte"));
    const formData = new FormData();

    const foto = this.instructorForm.get('fotoPerfil')?.value;
    if(!foto){
      this.showErrorAlert("Error","Foto de perfil necesaria")
      return
    }
  if (foto instanceof File) {
      formData.append('foto', foto);
    }
    if (this.instructorForm.invalid) return;
    const instructorDTO: InstructorDTO= {
            email : this.instructorForm.value.email,
            nombre: this.instructorForm.value.nombre,
            apellido : this.instructorForm.value.apellido,
            password: this.instructorForm.value.password,
            telefono: this.instructorForm.value.telefono,
            especialidad : this.instructorForm.value.especialidad,
            experiencia:this.instructorForm.value.experiencia,
            rol: "instructor",
            idDeporte: Number(localStorage.getItem("idDeporte")),
            fotoPerfil: foto instanceof File ? foto.name : this.instructorForm.value.fotoPerfil,
            idOrganizacion: Number(localStorage.getItem("id")),
          };
          console.log(instructorDTO)
        formData.append('instructor', new Blob([JSON.stringify(instructorDTO)], { type: 'application/json' }));
      this.iservice.crearInstructor(token,formData).subscribe({
        next: () => {
          this.showSuccessAlert("Exito al agregar","Instructor Agregado correctamente")
          this.cargarInstructores();
          this.cerrarModal();
        },
        error: (err) => {
          this.showErrorAlert("Error al agregar",err.error)
          console.error(err)
        }
      });
    }

  eliminarInstructor(id: number): void {
  Swal.fire({
    title: '¿Estás seguro?',
    text: 'Esta acción eliminará al instructor permanentemente.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Not Token Found");
      }
      this.iservice.delete(id, token).subscribe({
        next: (data) => {
          this.showSuccessAlert("Éxito en la eliminación", "Instructor removido");
          this.cargarInstructores();
          this.loadUserData();
        },
        error: (err) => {
          this.showErrorAlert("Error en eliminación", err.message);
        }
      });
    }
  });
}

  private showSuccessAlert(title: string, message: string): void {
      Swal.fire({
        title: title,
        text: message,
        icon: 'success',
        confirmButtonColor: '#10b981',
        background: '#1f2937',
        color: '#fff',
        iconColor: '#10b981',
        timer: 3000,
        timerProgressBar: true
      });
    }
  private showErrorAlert(title: string, message: string): void {
      Swal.fire({
        title: title,
        text: message,
        icon: 'error',
        confirmButtonColor: '#ef4444',
        background: '#1f2937',
        color: '#fff',
        iconColor: '#ef4444'
      });
    }
  get nombre() {
  return this.instructorForm.get('nombre');
}
get apellido() {
  return this.instructorForm.get('apellido');
}
get email() {
  return this.instructorForm.get('email');
}
get password() {
  return this.instructorForm.get('password');
}
get telefono() {
  return this.instructorForm.get('telefono');
}
get especialidad() {
  return this.instructorForm.get('especialidad');
}
get experiencia() {
  return this.instructorForm.get('experiencia');
}
}
