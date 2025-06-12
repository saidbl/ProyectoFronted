import { Component, inject, OnInit } from '@angular/core';
import { ResumenCumplimientoDTO } from '../../../models/resumenCumplimientoDTO.model';
import { CheckInRutinaService } from '../../../services/checkinrutina.service';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { ResumenAtletasDTO } from '../../../models/resumenAtletasDTO.model';
import { DeportistaService } from '../../../services/deportista.service';
import { ProgressBarModule } from 'primeng/progressbar';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router'; 
import { MatIconModule } from '@angular/material/icon';
import Swal from 'sweetalert2';
import { InstructorService } from '../../../services/instructor.service';
@Component({
  selector: 'app-instructor-estadisticas',
  imports: [ChartModule, TableModule,ProgressBarModule,CommonModule,RouterModule,MatIconModule],
  templateUrl: './instructor-estadisticas.component.html',
  styleUrls: ['./instructor-estadisticas.component.css']
})
export class InstructorEstadisticasComponent implements OnInit {
  nombre: string = '';
  apellido: string = '';
  fotoPerfil: string = "http://localhost:8080/";
  data!: ResumenCumplimientoDTO;
  data2!: ResumenAtletasDTO;
  cargando = true;
  private crservice = inject(CheckInRutinaService);
  private dservice = inject(DeportistaService)
  private iservice = inject (InstructorService)
   navigation = [
  { name: 'Eventos', route: '../equipoEvento', icon: 'event' },
  { name: 'Deportistas', route: '../rutinaDeportista', icon: 'people' },
  { name: 'Equipos', route: '../crearEquipos', icon: 'groups' },
  { name: 'Rutinas', route: '../rutinas', icon: 'fitness_center' },
  { name: 'Principal', route: '..', icon: 'home' }
];
    showNotification: boolean = false;
  notificationMessage: string = '';
  showUserDropdown: boolean = false;
 constructor (public router : Router){}
  optionsDias = {
    indexAxis: 'y',
    scales: {
      x: {
        max: 100,
        ticks: {
          color: '#4A5568', 
          font: {
            size: 14,
            weight: 'bold'
          }
        },
        grid: {
          color: '#E2E8F0' 
        }
      },
      y: {
        ticks: {
          color: '#4A5568',
          font: {
            size: 14,
            weight: 'bold'
          }
        },
        grid: {
          display: false
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: '#2D3748', // Tailwind gray-800
        titleFont: { size: 16, weight: 'bold' },
        bodyFont: { size: 14 }
      }
    },
    responsive: true,
    maintainAspectRatio: false
  };

  optionsGeneral = {
    cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: {
            size: 14,
            weight: 'bold'
          },
          color: '#4A5568' // gray-700
        }
      },
      tooltip: {
        backgroundColor: '#2D3748',
        titleFont: { size: 16, weight: 'bold' },
        bodyFont: { size: 14 }
      }
    },
    responsive: true,
    maintainAspectRatio: false
  };
   optionsDistribucion = {
    plugins: {
      legend: { position: 'bottom' }
    }
  };

  ngOnInit(): void {
    const fotoPerfil = localStorage.getItem("fotoPerfil")
      const nom=localStorage.getItem("nombre")
      const ap = localStorage.getItem("apellido")
    const token = localStorage.getItem('token');
    const id = Number(localStorage.getItem('id'));
    if (!token) {
      throw new Error('Not Token Found');
    }
    this.crservice.getCumplimientoRutinasStats(token, id).subscribe({
      next: (res) => {
        this.data = res;
        this.cargando = false;
      }
    });
    this.dservice.getResumenAtletas(id,token).subscribe( {
      next: (res) => {
        this.data2 = res;
        console.log(this.data2)
        this.cargando = false;
        this.fotoPerfil = this.fotoPerfil+ fotoPerfil
          this.nombre=nom ?? ''
          this.apellido= ap ?? ''
      }
    });
  }
  toggleUserDropdown() {
  this.showUserDropdown = !this.showUserDropdown;
}

  get chartDataDias() {
    return {
      labels: this.data?.cumplimientoPorDia.map(d => d.dia),
      datasets: [{
        label: '% Cumplimiento',
        data: this.data?.cumplimientoPorDia.map(d => d.porcentajeCumplimiento),
        backgroundColor: '#4CAF50',
        borderRadius: 8,
        barPercentage: 0.7,
        categoryPercentage: 0.8
      }]
    };
  }
  isNumber(value: any): value is number {
  return typeof value === 'number' && !isNaN(value);
}

  get chartDataGeneral() {
    return {
      labels: ['Completadas', 'Incompletas'],
      datasets: [{
        data: [this.data?.porcentajeCompletadas, this.data?.porcentajeIncompletas],
        backgroundColor: ['#4CAF50', '#F44336'],
        borderWidth: 2,
        borderColor: '#FFFFFF'
      }]
    };
  }
  get chartDataDistribucion() {
    return {
      labels: this.data2?.distribucionPosicionGenero.map(d => d.posicion),
      datasets: [
        {
          label: 'Hombres',
          data: this.data2?.distribucionPosicionGenero.map(d => d.hombres),
          backgroundColor: '#42A5F5'
        },
        {
          label: 'Mujeres',
          data: this.data2?.distribucionPosicionGenero.map(d => d.mujeres),
          backgroundColor: '#FFA726'
        }
      ]
    };
  }

  cerrarSesion() {
   Swal.fire({
    title: '¿Estás seguro?',
    text: '¿Quieres cerrar sesión?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, cerrar sesión',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      this.iservice.logOut();
      this.router.navigate(['/login']);
      Swal.fire('Sesión cerrada', '', 'success');
    }
  });
  }
}
