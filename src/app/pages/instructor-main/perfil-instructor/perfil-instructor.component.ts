import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Deporte } from '../../../models/deporte.model';
import { InstructorService } from '../../../services/instructor.service';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { InstructorDTO } from '../../../models/instructorDTO.model';
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

  constructor(
    private router: Router
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
        throw new Error("Not Token Found")
      }
    const instructorId = localStorage.getItem("id")
    this.iservice.getInstructorById(Number(instructorId),token).subscribe({
      next: (data) => {
        this.profileForm.patchValue(data);
        this.previewImage = data.fotoPerfil || 'assets/default-avatar.png';
        this.loading = false;
      },
      error: () => this.router.navigate(['/error'])
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => this.previewImage = reader.result;
      reader.readAsDataURL(file);
      if (this.profileForm && this.profileForm.get('fotoPerfil')) {
  this.profileForm.get('fotoPerfil')!.setValue(file);
}
    }
  }

 onSubmit(): void {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Token no encontrado");

  const id = localStorage.getItem("id");
  if (this.profileForm.invalid || !id) return;

  const formData = new FormData();
  const foto = this.profileForm.get('fotoPerfil')?.value;
  if (foto) {
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
        fotoPerfil: this.profileForm.value.fotoPerfil?.name || null
      };
  formData.append('instructor', new Blob([JSON.stringify(instructorDTO)], { type: 'application/json' }));
  console.log(formData)
  this.iservice.updateInstructor(Number(id), token, formData).subscribe({
    next: (data) => alert("Actualizado"),
    error: (err) => alert("Error al Actualizar")
  });
}
}
