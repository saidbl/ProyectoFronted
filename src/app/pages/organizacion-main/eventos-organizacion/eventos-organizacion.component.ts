import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventoFecha } from '../../../models/eventoFecha.model';
import { EventoService } from '../../../services/evento.service';
import { Evento } from '../../../models/evento.model';
import { EventoFechaService } from '../../../services/eventoFecha.service';
import { RouterModule } from '@angular/router'; 
import { MatDialog } from '@angular/material/dialog';
import { EventoEditarComponent } from './evento-editar/evento-editar.component';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-eventos-organizacion',
  standalone: true,
  imports: [CommonModule,RouterModule,MatNativeDateModule],
  templateUrl: './eventos-organizacion.component.html',
  styleUrl: './eventos-organizacion.component.css'
})
export class EventosOrganizacionComponent {
  private eservice = inject(EventoService)
    private efservice = inject(EventoFechaService)
    private dialog = inject(MatDialog)
    eventos: Evento[] = [];
    cargando = true;
    modalAbierto = false;
    cargandoFechas = false;
    fechasEvento: EventoFecha[] = [];
    eventoIdActual: number | null = null;
    showUserDropdown: boolean = false;
    tabs = [
    { id: 'planificados', label: 'Planificados' },
    { id: 'activos', label: 'Activos' },
    { id: 'pasados', label: 'Pasados' }
    ];
  eventosPlanificados: Evento[] = [];
  eventosActivos: Evento[] = [];
  eventosPasados: Evento[] = [];
  currentTab: string = 'planificados';
  
    ngOnInit(): void {
      const token = localStorage.getItem("token")
      const id = Number(localStorage.getItem("id"))
      if(!token) {
        throw new Error("Not Token Found")
      }
      this.eservice.listEventosByOrganizacion(id,token).subscribe({
        next:(data)=>{
          this.eventos=data
          this.clasificarEventos(data);
          this.cargando = false;
        },
        error:(err)=>{
          console.error(err)
          this.cargando = false;
        }
      })
    }
    clasificarEventos(eventos: Evento[]): void {
      const ahora = new Date();
      this.eventosPlanificados = eventos.filter(evento => {
        const fechaEvento = new Date(evento.fecha);
        return fechaEvento > ahora && evento.estado === 'PLANIFICADO';
      });
  
      this.eventosActivos = eventos.filter(evento => {
        const fechaEvento = new Date(evento.fecha);
        return fechaEvento <= ahora && evento.estado === 'ACTIVO';
      });
  
      this.eventosPasados = eventos.filter(evento => {
        const fechaEvento = new Date(evento.fecha);
        return fechaEvento < ahora && evento.estado !== 'ACTIVO';
      });
    }
    getEventCount(tabId: string): number {
      switch(tabId) {
        case 'planificados': return this.eventosPlanificados.length;
        case 'activos': return this.eventosActivos.length;
        case 'pasados': return this.eventosPasados.length;
        default: return 0;
      }
    }
    abrirModalFechas(eventoId: number): void {
      const token = localStorage.getItem("token")
      const id = Number(localStorage.getItem("id"))
      if(!token) {
        throw new Error("Not Token Found")
      }
      this.cargandoFechas = true;
      this.modalAbierto = true;
      this.efservice.list(eventoId,token).subscribe({
        next:(data)=>{
          this.fechasEvento=data
          console.log(data)
          this.cargandoFechas = false
        },
        error:(err)=>{
          this.cargandoFechas = false;
          console.error(err)
        }
      })
    }
  
    cerrarModal(): void {
      this.modalAbierto = false;
      this.fechasEvento = [];
      this.eventoIdActual = null;
    }
    editarEvento(evento:Evento):void{
      const id = Number(localStorage.getItem("id"))
      const idDeporte = Number(localStorage.getItem("idDeporte"))
      const dialogRef = this.dialog.open(EventoEditarComponent, {
        width: '800px',
        data: { 
          evento: evento,
          idOrganizacion: id,
          idDeporte:idDeporte
        }
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result === 'actualizado') {
        }
      });
    }
    eliminarEvento(evento: Evento): void {
      const token = localStorage.getItem("token")
      if(!token) {
        throw new Error("Not Token Found")
      }
      if (confirm('¿Estás seguro de eliminar este evento?')) {
        this.eservice.delete(evento.id, token).subscribe({
          next:(data)=>{
            this.eventos = this.eventos.filter(e => e !== evento);
            if(data.success){
              console.log("eliminado")
            }else{
              alert("No se pudo eliminar")
            }
          },
          error:(err)=>{
            if (err.status === 0) {
              console.error('No se pudo conectar con el servidor. Por favor, verifica tu conexión a Internet.');
            } else {
              console.error('Error al eliminar la persona', err);
            }
          }
        })
      }
    }
    logout(){

    }
}
