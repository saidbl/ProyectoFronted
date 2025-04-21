import { Component } from '@angular/core';
import { RouterModule } from '@angular/router'; 
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-organizacion-main',
  standalone: true,
  imports: [RouterModule,CommonModule ],
  templateUrl: './organizacion-main.component.html',
  styleUrl: './organizacion-main.component.css'
})
export class OrganizacionMainComponent {
  nombre_organizacion:string= ""
  proximoEvento:any 
  totalEventos:number =0
  eventosActivos : number = 0
  totalEquipos:number =0
  eventosRecientes:any
}
