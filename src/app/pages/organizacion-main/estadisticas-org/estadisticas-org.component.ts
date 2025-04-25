import { Component, OnInit, inject } from '@angular/core';
import { EventoService } from '../../../services/evento.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DatePipe } from '@angular/common';
import { ChartConfiguration, ChartType } from 'chart.js';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon'; // <-- Añade esta importación
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';


interface StatsData {
  eventosPorMes: MesStats[];
  participacionEventos: ParticipacionEvento[];
}

interface MesStats {
  mes: string;
  total: number;
}

interface ParticipacionEvento {
  nombre: string;
  equiposInscritos: number;
  numMaxEquipos: number;
}

@Component({
  selector: 'app-estadisticas-org',
  standalone: true,
  imports: [FormsModule, CommonModule,MatCardModule,MatButtonModule,MatIconModule,MatProgressSpinnerModule,MatTableModule],
  providers: [DatePipe],
  templateUrl: './estadisticas-org.component.html',
  styleUrls: ['./estadisticas-org.component.css']
})
export class EstadisticasOrgComponent implements OnInit {
  statsData: StatsData | null = null;
  loading = true;
  error: string | null = null;
  private statsService= inject(EventoService)

  // Configuración gráfico de barras (eventos por mes)
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.7)',
        bodyFont: { family: "'Roboto', sans-serif", size: 14 },
        titleFont: { family: "'Roboto', sans-serif", size: 16, weight: 'bold' },
        padding: 12,
        cornerRadius: 8
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#64748B', font: { family: "'Roboto', sans-serif", size: 12 } }
      },
      y: {
        grid: { color: '#E2E8F0' },
        ticks: { color: '#64748B', font: { family: "'Roboto', sans-serif", size: 12 } }
      }
    }
  };

  public barChartType: ChartType = 'bar';
  public barChartData: any;

  // Configuración gráfico de participación
  public participationChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.7)',
        bodyFont: { family: "'Roboto', sans-serif", size: 14 },
        titleFont: { family: "'Roboto', sans-serif", size: 16, weight: 'bold' },
        padding: 12,
        cornerRadius: 8
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#64748B', font: { family: "'Roboto', sans-serif", size: 12 } }
      },
      y: {
        grid: { color: '#E2E8F0' },
        ticks: { color: '#64748B', font: { family: "'Roboto', sans-serif", size: 12 } }
      }
    }
  };

  public participationChartType: ChartType = 'bar';
  public participationChartData: any;

  constructor(
  ) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.loading = true;
    this.error = null;
    
    const token = localStorage.getItem("token");
    if (!token) {
      this.error = 'No se encontró token de autenticación';
      this.loading = false;
      return;
    }

    this.statsService.getEstadisticasGenerales(token).subscribe({
      next: (data) => {
        this.statsData = data;
        this.prepareChartData();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar las estadísticas. Intente nuevamente más tarde.';
        this.loading = false;
        console.error(err);
      }
    });
  }

  prepareChartData(): void {
    if (!this.statsData) return;

    // Datos para gráfico de eventos por mes
    this.barChartData = {
      labels: this.statsData.eventosPorMes.map(item => item.mes),
      datasets: [{
        data: this.statsData.eventosPorMes.map(item => item.total),
        backgroundColor: '#4F46E5',
        hoverBackgroundColor: '#6366F1',
        borderRadius: 8,
        borderSkipped: false
      }]
    };

    // Datos para gráfico de participación
    const eventos = this.statsData.participacionEventos;
    this.participationChartData = {
      labels: eventos.map(item => item.nombre),
      datasets: [
        {
          label: 'Equipos Inscritos',
          data: eventos.map(item => item.equiposInscritos),
          backgroundColor: '#10B981',
          hoverBackgroundColor: '#34D399',
          borderRadius: 8
        },
        {
          label: 'Máximo de Equipos',
          data: eventos.map(item => item.numMaxEquipos),
          backgroundColor: '#F59E0B',
          hoverBackgroundColor: '#FBBF24',
          borderRadius: 8
        }
      ]
    };
  }

  getFillPercentage(evento: ParticipacionEvento): number {
    return Math.round((evento.equiposInscritos / evento.numMaxEquipos) * 100);
  }

  refreshStats(): void {
    this.loadStats();
  }
}