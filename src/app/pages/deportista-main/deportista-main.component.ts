import { Component } from '@angular/core';

@Component({
  selector: 'app-deportista-main',
  standalone: true,
  imports: [],
  templateUrl: './deportista-main.component.html',
  styleUrl: './deportista-main.component.css'
})
export class DeportistaMainComponent {

  deportista: any = {};
  rutinasHoy: any[] = [];
  porcentajeCumplimiento: number = 0;
  totalCheckins: number = 0;
  streakActual: number = 0;
  proximoEvento: any = null;
  ultimosCheckins: any[] = [];

  cargarDatosDeportista() {
    // Obtener datos del deportista logueado
  }

  cargarRutinasHoy() {

  }

  cargarEstadisticas() {

  }

  cargarProximoEvento() {

  }

  cargarUltimosCheckins() {

  }

  inicializarGraficos(stats: any) {

  }


  editarCheckin(id: number) {
    // Lógica para editar check-in
  }

  eliminarCheckin(id: number) {
    // Lógica para eliminar check-in
  }

}

