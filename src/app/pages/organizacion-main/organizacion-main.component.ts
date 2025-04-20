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

}
