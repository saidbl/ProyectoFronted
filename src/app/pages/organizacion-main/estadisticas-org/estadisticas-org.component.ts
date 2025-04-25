import { Component, OnInit, inject } from '@angular/core';
import { EventoService } from '../../../services/evento.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon'; // <-- Añade esta importación
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { BaseChartDirective, provideCharts,withDefaultRegisterables} from 'ng2-charts';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NgxEchartsModule } from 'ngx-echarts';
export interface MonthlyEventStats {
  mes: string;
  total: number;
}

export interface EventParticipation {
  nombre: string;
  equiposInscritos: number;
  numMaxEquipos: number;
}

export interface StatsData {
  eventosPorMes: MonthlyEventStats[];
  participacionEventos: EventParticipation[];
}
@Component({
    standalone:true,
    selector: 'app-estadisticas-org',
    imports: [CommonModule,
      MatCardModule,
      MatTableModule,
      MatProgressBarModule,
      MatButtonModule,
      MatIconModule,
      MatProgressSpinnerModule,
      NgxEchartsModule],
    providers: [DatePipe,
      provideCharts(withDefaultRegisterables())
    ],
    templateUrl: './estadisticas-org.component.html',
    styleUrls: ['./estadisticas-org.component.css']
})
export class EstadisticasOrgComponent implements OnInit {
  private eservice = inject(EventoService)
  eventosPorMes: any[] = [];
  participacionEventos: any[] = [];
  eventsByMonthChart: any;
  participationChart: any;
  
  loading = true;
  error = false;

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.loading = true;
    this.error = false;
    const id = Number(localStorage.getItem("id"))
    const token = localStorage.getItem("token")
    if(!token) {
      throw new Error("Not Token Found")
    }
    this.eservice.getEstadisticasGenerales(token,id).subscribe({
      next: (data) => {
        this.eventosPorMes = data.eventosPorMes || [];
        this.participacionEventos = data.participacionEventos || [];
        this.prepareCharts();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading stats:', err);
        this.error = true;
        this.loading = false;
      }
    });
  }

  prepareCharts(): void {
    // Ordenar eventos por mes cronológicamente
    const sortedEventsByMonth = [...this.eventosPorMes].sort((a, b) => {
      const dateA = new Date(a[0] + '-01');
      const dateB = new Date(b[0] + '-01');
      return dateA.getTime() - dateB.getTime();
    });

    // Gráfico de eventos por mes
    this.eventsByMonthChart = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      xAxis: {
        type: 'category',
        data: sortedEventsByMonth.map(item => item[0]),
        axisLabel: {
          rotate: 45
        }
      },
      yAxis: {
        type: 'value',
        name: 'Número de Eventos'
      },
      series: [{
        data: sortedEventsByMonth.map(item => item[1]),
        type: 'bar',
        itemStyle: {
          color: '#4e73df'
        },
        barWidth: '60%'
      }]
    };

    // Filtrar eventos con participación (eliminar duplicados si es necesario)
    const uniqueEvents = this.participacionEventos.filter((event, index, self) =>
      index === self.findIndex(e => e[0] === event[0])
    );

    // Gráfico de participación
    this.participationChart = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: (params: any) => {
          const data = params[0].data;
          return `
            <strong>${params[0].name}</strong><br/>
            Inscritos: ${data[1]}<br/>
            Capacidad: ${data[2]}<br/>
            Ocupación: ${((data[1]/data[2])*100).toFixed(1)}%
          `;
        }
      },
      xAxis: {
        type: 'category',
        data: uniqueEvents.map(item => item[0]),
        axisLabel: {
          rotate: 45
        }
      },
      yAxis: {
        type: 'value',
        name: 'Número de Equipos'
      },
      series: [
        {
          name: 'Inscritos',
          type: 'bar',
          data: uniqueEvents.map(item => [item[0], item[1], item[2]]),
          itemStyle: {
            color: '#1cc88a'
          }
        },
        {
          name: 'Capacidad',
          type: 'bar',
          data: uniqueEvents.map(item => [item[0], item[2]]),
          itemStyle: {
            color: '#e74a3b'
          }
        }
      ]
    };
  }

  calculatePercentage(inscritos: number, capacidad: number): number {
    return capacidad > 0 ? (inscritos / capacidad) * 100 : 0;
  }

  refreshStats(): void {
    this.loadStats();
  }
}