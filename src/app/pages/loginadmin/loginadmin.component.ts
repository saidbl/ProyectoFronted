import { Component , inject} from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { CommonModule, NgFor } from '@angular/common';
import { Router } from '@angular/router';
import { DeportistaService } from '../../services/deportista.service';
import { OrganizacionService } from '../../services/organizacion.service';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { InstructorService } from '../../services/instructor.service';
import { AdminService } from '../../services/admin.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-loginadmin',
  imports: [CommonModule, ReactiveFormsModule, MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule],
  templateUrl: './loginadmin.component.html',
  styleUrl: './loginadmin.component.css'
})
export class LoginadminComponent {
loginForm : FormGroup;
  private aservice = inject(AdminService)
  constructor(private fb: FormBuilder, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['',[Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      tipoUsuario: ['ADMIN',[Validators.required]]
    });
  }
  login() {
    const { email, password} = this.loginForm.value;

      this.aservice.login(email, password).subscribe({
        next: (data) => {
          console.log(data)
          if (data.statusCode === 200) {
            console.log(data)
            localStorage.setItem("token", data.token);
            localStorage.setItem("rol", data.rol);
            localStorage.setItem("id",data.id);
            localStorage.setItem("idDeporte",data.idDeporte)
            localStorage.setItem("fotoPerfil",data.fotoPerfil)
            localStorage.setItem("nombre",data.nombre)
            localStorage.setItem("apellido",data.apellido)
            Swal.fire({
              icon: 'success',
              title: '¡Bienvenido!',
              text: 'Inicio de sesión exitoso',
              confirmButtonColor: '#10b981',
              background: '#1f2937',
              color: '#fff',
              timer: 2000,
              timerProgressBar: true,
              showConfirmButton: false
            }).then(() => {
              this.router.navigate(['/registro']);
            });
          } else {
             Swal.fire({
              icon: 'error',
              title: data.message,
              text: 'El correo o la contraseña son incorrectos.',
              confirmButtonText: 'Intentar de nuevo',
              confirmButtonColor: '#ef4444',
              background: '#1f2937',
              color: '#fff'
            });
          }
        },
        error: (error) => {
           Swal.fire({
            icon: 'error',
            title: 'Credenciales incorrectas',
            text: error,
            confirmButtonText: 'Intentar de nuevo',
            confirmButtonColor: '#ef4444',
            background: '#1f2937',
            color: '#fff'
          });
        }
      });
    }
  }

