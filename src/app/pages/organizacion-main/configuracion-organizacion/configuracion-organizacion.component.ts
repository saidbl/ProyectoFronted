import { inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Organizacion } from '../../../models/organizacion.model';
import { Deporte } from '../../../models/deporte.model';
import { OrganizacionService } from '../../../services/organizacion.service';
import { OrganizacionDTO } from '../../../models/organizacionDTO.model';
import { MatIcon } from '@angular/material/icon';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-configuracion-organizacion',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatIcon
  ],
  templateUrl: './configuracion-organizacion.component.html',
  styleUrl: './configuracion-organizacion.component.css'
})
export class ConfiguracionOrganizacionComponent {
  profileForm: FormGroup;
  organizacion!: Organizacion;
  deportes: Deporte[] = [];
  tiposOrganizacion: string[] = ['Club', 'Federación', 'Asociación', 'Liga'];
  isLoading = true;
  previewImage: string | ArrayBuffer | null = null;
  isSaving = false;
   loading = true;
  private route = inject(ActivatedRoute)
  private oservice = inject(OrganizacionService)

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
    tipo: {
      pattern: 'Ingresa el tipo de organizacion que son'
    },
    nombreOrganizacion: {
      required: 'El nombre de la organizacion es obligatorio'
    },
  };
  notificationMessage = ""
  showNotification = ""
  constructor(
    private fb: FormBuilder,
    public router: Router,
  ) {
    this.profileForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.pattern('^[0-9]{9,12}$')]],
      nombreOrganizacion: ['', Validators.required],
      direccion: ['', Validators.required],
      tipo: ['', Validators.required],
      imagen: ['']
    });
  }

  ngOnInit(): void {
    const token =localStorage.getItem("token")
    const id = Number(localStorage.getItem("id"))
    if(!token) {
      throw new Error("Not Token Found")
    }
    this.oservice.getbyId(id,token).subscribe({
      next: (organizacion) => {
        this.organizacion = organizacion;
        this.profileForm.patchValue(organizacion);
        this.isLoading = false;
        this.previewImage= 'http://localhost:8080/' +organizacion.imagen
        console.log(this.previewImage)
      },
      error: () => {
        this.isLoading = false;
       this.showErrorAlert("Error","Error al cargar datos")
        this.router.navigate(['/organizaciones']);
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
      this.profileForm.get('imagen')!.setValue(file);
    };
    reader.readAsDataURL(file);
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
     const foto = this.profileForm.get('imagen')?.value;
     if (foto instanceof File) {
         formData.append('foto', foto);
       }
     const oDTO: OrganizacionDTO= {
           email : this.profileForm.value.email,
           nombre: this.profileForm.value.nombre,
           direccion : this.profileForm.value.direccion,
           telefono: this.profileForm.value.telefono,
           nombreOrganizacion : this.profileForm.value.nombreOrganizacion,
           tipo:this.profileForm.value.tipo,
           idDeporte: Number(localStorage.getItem("idDeporte")),
           imagen: foto instanceof File ? foto.name : this.profileForm.value.imagen
         };
     formData.append('organizacion', new Blob([JSON.stringify(oDTO)], { type: 'application/json' }));
     console.log(formData)
     this.oservice.update(Number(id), token, formData).subscribe({
       next: (data) => {
         this.loading = false;
          if (data.imagen) {
             localStorage.setItem("fotoPerfil", data.imagen);
           }
           localStorage.setItem("nombre", data.nombre);
           localStorage.setItem("apellido", data.apellido);
           this.previewImage = 'http://localhost:8080/' +data.imagen
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
      private getFieldName(key: string): string {
    const fieldNames: Record<string, string> = {
      nombre: 'Nombre',
      apellido: 'Apellido',
      email: 'Email',
      telefono: 'Teléfono',
      especialidad: 'NombreOrganizacion',
      experiencia: 'Tipo',
      id_deporte: 'Deporte',
      fotoPerfil: "Imagen"
    };
    return fieldNames[key] || key;
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


  get email() { return this.profileForm.get('email'); }
  get nombre() { return this.profileForm.get('nombre'); }
  get telefono() { return this.profileForm.get('telefono'); }
  get nombreOrganizacion() { return this.profileForm.get('nombreOrganizacion'); }
  get direccion() { return this.profileForm.get('direccion'); }
  get tipo() { return this.profileForm.get('tipo'); }
  get fotoPerfil() { return this.profileForm.get('imagen'); }
}
