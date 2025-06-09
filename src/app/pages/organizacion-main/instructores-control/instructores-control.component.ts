import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InstructorService } from '../../../services/instructor.service';
import { Instructor } from '../../../models/instructor.model';
import { InstructorDTO } from '../../../models/instructorDTO.model';
import { MatIcon } from '@angular/material/icon';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-instructores-control',
  imports: [ MatIcon,ReactiveFormsModule,CommonModule],
  templateUrl: './instructores-control.component.html',
  styleUrl: './instructores-control.component.css'
})
export class InstructoresControlComponent {
  private iservice  = inject(InstructorService)
  instructores: Instructor[] = [];
  mostrarModal = false;
  previewImage: string | ArrayBuffer | null = null;
  instructorEditando: any = null;
  instructorForm: FormGroup;
  constructor(
    private fb: FormBuilder,
  ) {
    this.instructorForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required,Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/)]],
      telefono: [''],
      especialidad: ['', Validators.required],
      experiencia: [0, [Validators.required, Validators.min(0)]],
      rol: ["instructor"],
      idDeporte: [Number(localStorage.getItem("idDeporte"))],
      fotoPerfil: ['']
    });
  }

  ngOnInit(): void {
    this.cargarInstructores();
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
    const formData = new FormData();
    const foto = this.instructorForm.get('fotoPerfil')?.value;
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
            fotoPerfil: foto instanceof File ? foto.name : this.instructorForm.value.fotoPerfil
          };
        formData.append('instructor', new Blob([JSON.stringify(instructorDTO)], { type: 'application/json' }));
      this.iservice.crearInstructor(token,formData).subscribe({
        next: () => {
          this.cargarInstructores();
          this.cerrarModal();
        },
        error: (err) => console.error('Error creando instructor', err)
      });
    }

  eliminarInstructor(id: number): void {
    
  }
}
