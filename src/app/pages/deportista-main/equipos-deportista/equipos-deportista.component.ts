import { Component, OnInit ,inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Equipo } from '../../../models/equipo.model';
import { EquipoService } from '../../../services/equipo.service';
@Component({
    selector: 'app-equipos-deportista',
    standalone:true,
    imports: [CommonModule],
    templateUrl: './equipos-deportista.component.html',
    styleUrl: './equipos-deportista.component.css'
})
export class EquiposDeportistaComponent implements OnInit{
  private eservice = inject(EquipoService)
  ngOnInit(): void {
    const id = Number(localStorage.getItem("id"))
    const token = localStorage.getItem("token")
    if(!token) {
      throw new Error("Not Token Found")
    }
    this.eservice.listByIdDeportista(id,token).subscribe({
      next: (data)=>{
        this.equipos=data
      },
      error: (err)=>{
        console.error(err)
      }
    })
  }
  equipos: Equipo[]=[]

}
