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
import Swal from 'sweetalert2';

@Component({
    selector: 'app-login',
    standalone:true,
    imports: [CommonModule, ReactiveFormsModule, MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule],
    templateUrl: './login.component.html',
    styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm : FormGroup;
  selectedTipoUsuario: string = 'DEPORTISTA';
  private dService=inject(DeportistaService)
  private oService=inject(OrganizacionService)
  private iService=inject(InstructorService)
  constructor(private fb: FormBuilder, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['',[Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      tipoUsuario: ['DEPORTISTA',[Validators.required]]
    });
  }
  login() {
    console.log(this.loginForm.invalid)
    if (this.loginForm.invalid) {
    Swal.fire({
      icon: 'warning',
      title: 'Campos incompletos',
      text: 'Por favor, completa todos los campos correctamente.',
      confirmButtonColor: '#f6c23e',
      background: '#1f2937',
      color: '#fff'
    });
    return;
  }
    const { email, password, tipoUsuario } = this.loginForm.value;
    switch (tipoUsuario) {
      case 'DEPORTISTA':
        this.dService.login(email, password).subscribe({
          next: (data) => {
            console.log(data)
            if (data.statusCode === 200) {
              console.log(data)
              localStorage.setItem("idInstructor",data.idInstructor)
              localStorage.setItem("token", data.token);
              localStorage.setItem("rol", data.rol);
              localStorage.setItem("id",data.id);
              localStorage.setItem("idDeporte",data.idDeporte)
              localStorage.setItem("posicion",data.posicion)
              localStorage.setItem("idPosicion",data.posicion.id)
              localStorage.setItem("fotoPerfil",data.fotoPerfil)
              localStorage.setItem("nombre",data.nombre)
              localStorage.setItem("apellido",data.apellido)
              console.log(data)
              console.log(data.idDeporte)
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
  this.router.navigate(['/deportista']);
});
              console.log("Exito en conexion")
            } else {
               Swal.fire({
  icon: 'error',
  title: 'Credenciales incorrectas',
  text: data.message,
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
  text: 'El correo o la contraseña son incorrectos.',
  confirmButtonText: 'Intentar de nuevo',
  confirmButtonColor: '#ef4444',
  background: '#1f2937',
  color: '#fff'
});
          }
        });
      break;
      
    case 'ORGANIZACION':
      this.oService.login(email, password).subscribe({
        next: (data) => {
          console.log(data)
          if (data.statusCode === 200) {
            console.log(data)
            localStorage.setItem("token", data.token);
            localStorage.setItem("rol", data.rol);
            localStorage.setItem("id",data.id);
            localStorage.setItem("idDeporte",data.idDeporte)
            localStorage.setItem("nombre",data.nombre)
            localStorage.setItem("fotoPerfil",data.fotoPerfil)
            console.log(data.id);
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
  this.router.navigate(['/organizacion']);
});
            console.log("Exito en conexion")
          } else {
             Swal.fire({
  icon: 'error',
  title: 'Credenciales incorrectas',
  text: data.message,
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
  text: 'El correo o la contraseña son incorrectos.',
  confirmButtonText: 'Intentar de nuevo',
  confirmButtonColor: '#ef4444',
  background: '#1f2937',
  color: '#fff'
});
        }
      });
        break;
      
    case 'INSTRUCTOR':
      this.iService.login(email, password).subscribe({
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
            console.log(localStorage);
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
  this.router.navigate(['/instructor']);
});
            console.log("Exito en conexion")
          } else {
             Swal.fire({
  icon: 'error',
  title: 'Credenciales incorrectas',
  text: data.message,
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
  text: 'El correo o la contraseña son incorrectos.',
  confirmButtonText: 'Intentar de nuevo',
  confirmButtonColor: '#ef4444',
  background: '#1f2937',
  color: '#fff'
});
        }
      });
    }
  }
  setTipoUsuario(tipo:string){
    this.selectedTipoUsuario = tipo;
    this.loginForm.patchValue({ tipoUsuario: tipo });
    console.log(tipo)

  }
}