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
  organizacionForm: FormGroup;
  organizacion!: Organizacion;
  deportes: Deporte[] = [];
  tiposOrganizacion: string[] = ['Club', 'Federación', 'Asociación', 'Liga'];
  isLoading = true;
  isSaving = false;
  private route = inject(ActivatedRoute)
  private oservice = inject(OrganizacionService)

  notificationMessage = ""
  showNotification = ""
  constructor(
    private fb: FormBuilder,
    public router: Router,
    private snackBar: MatSnackBar
  ) {
    this.organizacionForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      nombre: ['', Validators.required],
      telefono: ['', Validators.required],
      nombreOrganizacion: ['', Validators.required],
      direccion: ['', Validators.required],
      tipo: ['', Validators.required],
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
        this.organizacionForm.patchValue(organizacion);
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.showError('Error al cargar los datos de la organización');
        this.router.navigate(['/organizaciones']);
      }
    });
  }

  onSubmit(): void {
    const token =localStorage.getItem("token")
    const id = Number(localStorage.getItem("id"))
    if(!token) {
      throw new Error("Not Token Found")
    }
    if (this.organizacionForm.invalid) {
      this.organizacionForm.markAllAsTouched();
      this.showError('Por favor complete todos los campos requeridos');
      return;
    }
    this.isSaving = true;
    const updatedData: OrganizacionDTO = this.organizacionForm.value;

    this.oservice.update(id,updatedData,token)
      .subscribe({
        next: () => {
          this.showSuccess('Organización actualizada correctamente');
          this.isSaving = false;
        },
        error: (err) => {
          this.showError('Error al actualizar la organización');
          this.isSaving = false;
          console.error('Error updating organization:', err);
        }
      });
  }

  showSuccess(message: string): void {
   
  }

  showError(message: string): void {
    
  }

  get email() { return this.organizacionForm.get('email'); }
  get nombre() { return this.organizacionForm.get('nombre'); }
  get telefono() { return this.organizacionForm.get('telefono'); }
  get nombreOrganizacion() { return this.organizacionForm.get('nombreOrganizacion'); }
  get direccion() { return this.organizacionForm.get('direccion'); }
  get tipo() { return this.organizacionForm.get('tipo'); }
}
