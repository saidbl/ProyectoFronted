import { Component ,inject} from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule} from '@angular/forms';
import Swal from 'sweetalert2';
import { Deporte } from '../../../models/deporte.model';
import { DeporteService } from '../../../services/deporte.service';
import { CommonModule } from '@angular/common';
import { OrganizacionDTO } from '../../../models/organizacionDTO.model';
import { OrganizacionService } from '../../../services/organizacion.service';
import { AdminService } from '../../../services/admin.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-registro-organizacion',
  imports: [ReactiveFormsModule,CommonModule],
  templateUrl: './registro-organizacion.component.html',
  styleUrl: './registro-organizacion.component.css'
})
export class RegistroOrganizacionComponent {
  private dservice = inject(DeporteService)
  private oservice = inject(OrganizacionService)
  private aservice = inject(AdminService)
registroForm: FormGroup;
  deportes: Deporte[] = [];
  tiposOrganizacion = ['Club', 'Liga', 'Asociación', 'Federación', 'Escuela'];
  submitted = false;

  imagenPreview: string | ArrayBuffer | null = null;

  constructor(
    private fb: FormBuilder,public router:Router
  ) {
    this.registroForm = this.fb.group({
      email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
      password: ['', [Validators.required, Validators.minLength(8),Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/)]],
      nombre: ['', [Validators.required, Validators.maxLength(255)]],
      telefono: ['', [Validators.required,Validators.pattern('^[0-9+ ]{7,20}$')]],
      nombre_organizacion: ['', [Validators.required, Validators.maxLength(255)]],
      direccion: ['', [Validators.required,Validators.maxLength(255)]],
      tipo: ['', [Validators.required]],
      id_deporte: ['', [Validators.required]],
      imagen: [''],
      rol: ['organizacion'],
      fotoPerfil: ['']
    });
  }

  ngOnInit(): void {
    const token=localStorage.getItem("token")
    if (!token) {
            Swal.fire({
                icon: 'warning',
                title: 'Sesión no válida',
                text: 'No se encontró el token de autenticación. Serás redirigido al login.',
                confirmButtonText: 'Aceptar'
              })
              this.router.navigate(['/login']);
              return;
          }
    this.cargarDeportes();
  }

  onFileChange(event: Event) {
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
      this.imagenPreview = reader.result;
      this.registroForm.get('fotoPerfil')!.setValue(file);
    };
    reader.readAsDataURL(file);
}
  cargarDeportes() {
    const token=localStorage.getItem("token")
          const instructorId = Number(localStorage.getItem("id"))
          console.log(localStorage)
          if (!token) {
            Swal.fire({
                icon: 'warning',
                title: 'Sesión no válida',
                text: 'No se encontró el token de autenticación. Serás redirigido al login.',
                confirmButtonText: 'Aceptar'
              })
              this.router.navigate(['/login']);
              return;
          }
    this.dservice.list(token).subscribe({
      next:(data)=>{
        this.deportes= data
      },
      error:(err)=>{
        Swal.fire({
                icon: 'error',
                title: 'Error al cargar deportes',
                text: err,
                confirmButtonText: 'Aceptar'
              })
      }
    })
  }

  get f() { return this.registroForm.controls; }

  onSubmit() {
     const token = localStorage.getItem("token")
        if(!token) {
          throw new Error("Not Token Found")
        }
        const formData = new FormData();
    
        const foto = this.registroForm.get('fotoPerfil')?.value;
        if(!foto){
          this.showErrorAlert("Error","Foto de perfil necesaria")
          return
        }
      if (foto instanceof File) {
          formData.append('foto', foto);
        }
        if (this.registroForm.invalid) return;
        const oDTO: OrganizacionDTO= {
                email : this.registroForm.value.email,
                nombre: this.registroForm.value.nombre,
                password: this.registroForm.value.password,
                telefono: this.registroForm.value.telefono,
                rol: "organizacion",
                direccion:this.registroForm.value.direccion,
                nombreOrganizacion:this.registroForm.value.nombre_organizacion,
                tipo:this.registroForm.value.tipo,
                idDeporte:this.registroForm.value.id_deporte,
                imagen: foto instanceof File ? foto.name : this.registroForm.value.fotoPerfil
              };
            formData.append('organizacion', new Blob([JSON.stringify(oDTO)], { type: 'application/json' }));
          this.oservice.crearOrg(token,formData).subscribe({
            next: () => {
              this.showSuccessAlert("Exito al agregar","Instructor Agregado correctamente")
              this.limpiarFormulario()
              this.cargarDeportes()
            },
            error: (err) => {
              this.showErrorAlert("Error al agregar",err.error)
              console.error(err)
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

      limpiarFormulario(): void {
  this.registroForm.reset();
  this.imagenPreview = null 
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
            this.aservice.logOut();
            this.router.navigate(['/login']);
            Swal.fire('Sesión cerrada', '', 'success');
          }
        });
        }
}
