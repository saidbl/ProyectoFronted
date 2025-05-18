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
      email: [''],
      password: [''],
      tipoUsuario: ['']
    });
  }
  login() {
    const { email, password, tipoUsuario } = this.loginForm.value;
    switch (tipoUsuario) {
      case 'DEPORTISTA':
        this.dService.login(email, password).subscribe({
          next: (data) => {
            console.log(data)
            if (data.statusCode === 200) {
              console.log(data)
              localStorage.setItem("token", data.token);
              localStorage.setItem("rol", data.rol);
              localStorage.setItem("id",data.id);
              localStorage.setItem("idDeporte",data.idDeporte)
              localStorage.setItem("posicion",data.posicion)
              localStorage.setItem("nombre",data.nombre)
              localStorage.setItem("apellido", data.apellido)
              console.log(data)
              console.log(data.idDeporte)
              this.router.navigate(['/deportista']);
              console.log("Exito en conexion")
            } else {
              console.log("Eliminar")
            }
          },
          error: (error) => {
            console.log("adios")
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
            console.log(data.id);
            this.router.navigate(['/organizacion']);
            console.log("Exito en conexion")
          } else {
            console.log("Eliminar")
          }
        },
        error: (error) => {
          console.log("adios")
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
            this.router.navigate(['/instructor']);
            console.log("Exito en conexion")
          } else {
            console.log("Eliminar")
          }
        },
        error: (error) => {
          console.log("adios")
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