import { Component, inject, OnInit } from '@angular/core';
import { ResumenCumplimientoDTO } from '../../../models/resumenCumplimientoDTO.model';
import { CheckInRutinaService } from '../../../services/checkinrutina.service';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-instructor-estadisticas',
  imports: [ChartModule, TableModule],
  templateUrl: './instructor-estadisticas.component.html',
  styleUrls: ['./instructor-estadisticas.component.css']
})
export class InstructorEstadisticasComponent implements OnInit {
  data!: ResumenCumplimientoDTO;
  cargando = true;
  private crservice = inject(CheckInRutinaService);

  optionsDias = {
    indexAxis: 'y',
    scales: {
      x: {
        max: 100,
        ticks: {
          color: '#4A5568', // Tailwind gray-700
          font: {
            size: 14,
            weight: 'bold'
          }
        },
        grid: {
          color: '#E2E8F0' // Tailwind gray-300
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

  ngOnInit(): void {
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
}
