import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Deporte } from '../../../models/deporte.model';
import { InstructorService } from '../../../services/instructor.service';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { InstructorDTO } from '../../../models/instructorDTO.model';
import Swal from 'sweetalert2';
MatIcon
@Component({
  selector: 'app-perfil-instructor',
  imports: [ ReactiveFormsModule ,CommonModule,MatIcon],
  templateUrl: './perfil-instructor.component.html',
  styleUrl: './perfil-instructor.component.css'
})
export class PerfilInstructorComponent {
  profileForm: FormGroup;
  previewImage: string | ArrayBuffer | null = null;
  deportes: Deporte[] = [];
  loading = true;
  private iservice = inject(InstructorService)
  private fb = inject(FormBuilder)

  validationMessages = {
    nombre: {
      required: 'El nombre es obligatorio',
      maxlength: 'El nombre no puede tener más de 50 caracteres'
    },
    apellido: {
      required: 'El apellido es obligatorio',
      maxlength: 'El apellido no puede tener más de 50 caracteres'
    },
    email: {
      required: 'El email es obligatorio',
      email: 'Ingresa un email válido'
    },
    telefono: {
      pattern: 'Ingresa un teléfono válido (9-12 dígitos)'
    },
    especialidad: {
      required: 'La especialidad es obligatoria'
    },
    experiencia: {
      required: 'La experiencia es obligatoria',
      min: 'La experiencia no puede ser negativa',
      max: 'La experiencia no puede ser mayor a 50 años'
    }
  };
  constructor(
    public router: Router
  ) {
    this.profileForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(50)]],
      apellido: ['', [Validators.required, Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.pattern('^[0-9]{9,12}$')]],
      especialidad: ['', Validators.required],
      experiencia: ['', [Validators.required, Validators.min(0), Validators.max(50)]],
      id_deporte: [localStorage.getItem("idDeporte"), Validators.required],
      fotoPerfil: ['']
    });
  }

  ngOnInit(): void {
    this.loadInstructorData();
  }

  private loadInstructorData(): void {
    const token=localStorage.getItem("token")
      if(!token) {
        this.showSessionExpiredAlert();
      return;
      }
    const instructorId = localStorage.getItem("id")
    if (!instructorId) {
      this.showSessionExpiredAlert();
      return;
    }
    this.iservice.getInstructorById(Number(instructorId),token).subscribe({
      next: (data) => {
        this.profileForm.patchValue(data);
        this.previewImage = 'http://localhost:8080/' +data.fotoPerfil 
        this.loading = false;
      },
      error: () =>{
        this.showErrorAlert('Error', 'No se pudieron cargar los datos del instructor');
      }
    });
  }

  onFileSelected(event: any): void {
    const fileInput = event.target as HTMLInputElement;
    const file: File | null = fileInput.files?.[0] || null;
    if (!file) return;
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    const maxSizeMB = 2;
    if (!allowedTypes.includes(file.type)) {
      this.showWarningAlert('Archivo inválido', 'Solo se permiten imágenes JPEG o PNG');
      fileInput.value = ''; 
      return;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      this.showWarningAlert('Archivo demasiado grande', 'La imagen debe pesar menos de 2MB');
      fileInput.value = ''; 
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      this.previewImage = reader.result;
      this.profileForm.get('fotoPerfil')!.setValue(file);
    };
    reader.readAsDataURL(file);
  }

 onSubmit(): void {
  const token = localStorage.getItem("token");
  if (!token) {
      this.showSessionExpiredAlert();
      return;
    }
  this.profileForm.markAllAsTouched();
  if (this.profileForm.invalid) {
      Swal.fire("Formulario inválido", "Por favor completa correctamente todos los campos.", "warning");
      this.showFormErrors();
      return;
    }
     this.loading = true;
  const id = localStorage.getItem("id");
  if (this.profileForm.invalid || !id) return;

  const formData = new FormData();
  const foto = this.profileForm.get('fotoPerfil')?.value;
  if (foto instanceof File) {
      formData.append('foto', foto);
    }
  const instructorDTO: InstructorDTO= {
        email : this.profileForm.value.email,
        nombre: this.profileForm.value.nombre,
        apellido : this.profileForm.value.apellido,
        telefono: this.profileForm.value.telefono,
        especialidad : this.profileForm.value.especialidad,
        experiencia:this.profileForm.value.experiencia,
        idDeporte: Number(localStorage.getItem("idDeporte")),
        fotoPerfil: foto instanceof File ? foto.name : this.profileForm.value.fotoPerfil
      };
  formData.append('instructor', new Blob([JSON.stringify(instructorDTO)], { type: 'application/json' }));
  console.log(formData)
  this.iservice.updateInstructor(Number(id), token, formData).subscribe({
    next: (data) => {
      this.loading = false;
       if (data.fotoPerfil) {
          localStorage.setItem("fotoPerfil", data.fotoPerfil);
        }
        localStorage.setItem("nombre", data.nombre);
        localStorage.setItem("apellido", data.apellido);
        this.previewImage = 'http://localhost:8080/' +data.fotoPerfil 
        this.showSuccessAlert('Perfil actualizado', 'Los cambios se guardaron correctamente');
    },
    error: (err) => {
        this.loading = false;
        this.showErrorAlert('Error', 'Hubo un problema al actualizar el perfil');
        console.error(err);
      }
  });
}
 private showFormErrors(): void {
    const invalidFields = Object.keys(this.profileForm.controls)
      .filter(key => this.profileForm.controls[key].invalid)
      .map(key => {
        const control = this.profileForm.get(key);
        const errors = control?.errors ? Object.keys(control.errors) : [];
        return {
          name: this.getFieldName(key),
          errors: errors.map(errorKey => {
  const fieldMessages = this.validationMessages[key as keyof typeof this.validationMessages];
  if (fieldMessages && typeof fieldMessages === 'object' && errorKey in fieldMessages) {
    return fieldMessages[errorKey as keyof typeof fieldMessages];
  }
  return 'Error';
})
        };
      });

    const errorList = invalidFields.map(field => 
      `<li><strong>${field.name}:</strong> ${field.errors.join(', ')}</li>`
    ).join('');

    Swal.fire({
      title: 'Formulario incompleto',
      html: `<div class="text-left"><p>Por favor corrige los siguientes errores:</p><ul>${errorList}</ul></div>`,
      icon: 'warning',
      confirmButtonColor: '#3b82f6',
      background: '#1f2937',
      color: '#fff',
      iconColor: '#f59e0b',
      customClass: {
        htmlContainer: 'text-left'
      }
    });
  }
  private getFieldName(key: string): string {
    const fieldNames: Record<string, string> = {
      nombre: 'Nombre',
      apellido: 'Apellido',
      email: 'Email',
      telefono: 'Teléfono',
      especialidad: 'Especialidad',
      experiencia: 'Experiencia',
      id_deporte: 'Deporte'
    };
    return fieldNames[key] || key;
  }
  private showSessionExpiredAlert(): void {
    Swal.fire({
      title: 'Sesión expirada',
      text: 'Por favor inicia sesión nuevamente',
      icon: 'error',
      confirmButtonColor: '#3b82f6',
      background: '#1f2937',
      color: '#fff',
      iconColor: '#ef4444'
    }).then(() => {
      this.router.navigate(['/login']);
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

  private showWarningAlert(title: string, message: string): void {
    Swal.fire({
      title: title,
      text: message,
      icon: 'warning',
      confirmButtonColor: '#f59e0b',
      background: '#1f2937',
      color: '#fff',
      iconColor: '#f59e0b'
    });
  }
}
