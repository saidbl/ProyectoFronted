import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-rutinas-dep',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rutinas-dep.component.html',
  styleUrl: './rutinas-dep.component.css'
})
export class RutinasDepComponent implements OnInit{

  diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  diaFiltrado = 'TODOS';
  rutinas: any[] = [];
  rutinasFiltradas: any[] = [];
  
  // Datos del deportista
  nombre: string = '';
  apellido: string = '';
  posicion: string|null = '';
  deporte: string = '';


  ngOnInit(): void {
    this.posicion =localStorage.getItem("posicion")
    this.cargarDatosDeportista();
    this.cargarRutinas();
  }

  cargarDatosDeportista() {

  }

  cargarRutinas() {

  }

  filtrarPorDia(dia: string) {

  }

  getSafeUrl(url: string) {
  }

  registrarCheckin(rutinaId: number) {

  }
}
