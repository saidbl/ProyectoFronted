import { Component, OnInit, inject } from '@angular/core';
import { EventoService } from '../../../services/evento.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NgxEchartsModule } from 'ngx-echarts';
import * as echarts from 'echarts';
import { saveAs } from 'file-saver';

@Component({
  standalone: true,
  selector: 'app-estadisticas-org',
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatProgressBarModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    NgxEchartsModule
  ],
  templateUrl: './estadisticas-org.component.html',
  styleUrls: ['./estadisticas-org.component.css']
})
export class EstadisticasOrgComponent implements OnInit {
  private eservice = inject(EventoService);
  
  // Datos
  eventosPorMes: any[] = [];
  participacionEventos: any[] = [];
  
  // Configuración de gráficos
  eventsByMonthChartOptions: any;
  participationChartOptions: any;
  
  // Estados
  loading = true;
  error = false;

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.loading = true;
    this.error = false;
    const id = Number(localStorage.getItem("id"));
    const token = localStorage.getItem("token");
    
    if (!token) {
      throw new Error("Not Token Found");
    }
    
    this.eservice.getEstadisticasGenerales(token, id).subscribe({
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

    // Formatear nombres de meses
    const monthNames = sortedEventsByMonth.map(item => {
      const [year, month] = item[0].split('-');
      return new Date(parseInt(year), parseInt(month) - 1, 1).toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });
    });

    // Gráfico de eventos por mes - Versión Premium
    this.eventsByMonthChartOptions = {
      backgroundColor: 'transparent',
      animation: true, // Habilitar animaciones
      animationDuration: 1000,
      animationEasing: 'elasticOut',
      animationDelay: function (idx: number) {
        return idx * 100;
      },
      tooltip: {
        trigger: 'axis',
        className: 'chart-tooltip',
        backgroundColor: 'rgba(31, 41, 55, 0.9)',
        borderColor: 'rgba(55, 65, 81, 0.9)',
        textStyle: {
          color: '#F3F4F6'
        },
        axisPointer: {
          type: 'shadow',
          shadowStyle: {
            color: 'rgba(99, 102, 241, 0.1)'
          }
        },
        formatter: (params: any) => {
          return `
            <div class="text-gray-200 font-medium">${params[0].name}</div>
            <div class="text-blue-400 mt-1">${params[0].value} eventos</div>
          `;
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '12%',
        top: '10%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: monthNames,
        axisLine: {
          lineStyle: {
            color: '#4B5563'
          }
        },
        axisLabel: {
          color: '#9CA3AF',
          rotate: 30,
          fontSize: 11
        },
        axisTick: {
          alignWithLabel: true
        }
      },
      yAxis: {
        type: 'value',
        axisLine: {
          show: false
        },
        axisLabel: {
          color: '#9CA3AF'
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(75, 85, 99, 0.3)'
          }
        }
      },
      series: [{
        data: sortedEventsByMonth.map(item => item[1]),
        type: 'bar',
        barWidth: '40%',
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(96, 165, 250, 0.8)' },
            { offset: 1, color: 'rgba(139, 92, 246, 0.8)' }
          ]),
          borderRadius: [4, 4, 0, 0],
          shadowColor: 'rgba(139, 92, 246, 0.3)',
          shadowBlur: 8,
          shadowOffsetY: 4
        },
        emphasis: {
          itemStyle: {
            shadowColor: 'rgba(139, 92, 246, 0.5)',
            shadowBlur: 16
          }
        },
        label: {
          show: true,
          position: 'top',
          color: '#E5E7EB',
          formatter: '{c}'
        }
      }]
    };

    // Gráfico de participación - Versión Premium
    const uniqueEvents = this.participacionEventos.filter((event, index, self) =>
      index === self.findIndex(e => e[0] === event[0])
    );

    this.participationChartOptions = {
      backgroundColor: 'transparent',
      animation: true, // Habilitar animaciones
      animationDuration: 1000,
      animationEasing: 'elasticOut',
      animationDelay: function (idx: number) {
        return idx * 50;
      },
      tooltip: {
        trigger: 'axis',
        className: 'chart-tooltip',
        backgroundColor: 'rgba(31, 41, 55, 0.9)',
        borderColor: 'rgba(55, 65, 81, 0.9)',
        textStyle: {
          color: '#F3F4F6'
        },
        axisPointer: {
          type: 'shadow'
        },
        formatter: (params: any) => {
          const data = params[0].data;
          const percentage = ((data[1]/data[2])*100).toFixed(1);
          return `
            <div class="text-gray-200 font-medium">${params[0].name}</div>
            <div class="flex items-center mt-2">
              <span class="inline-block w-3 h-3 rounded-full mr-2 bg-green-400"></span>
              <span class="text-green-400">Inscritos: ${data[1]}</span>
            </div>
            <div class="flex items-center mt-1">
              <span class="inline-block w-3 h-3 rounded-full mr-2 bg-red-400"></span>
              <span class="text-red-400">Capacidad: ${data[2]}</span>
            </div>
            <div class="mt-2 text-blue-400">Ocupación: ${percentage}%</div>
          `;
        }
      },
      legend: {
        data: ['Inscritos', 'Capacidad'],
        textStyle: {
          color: '#9CA3AF'
        },
        right: '4%',
        top: '0%'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '12%',
        top: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: uniqueEvents.map(item => this.truncateString(item[0], 15)),
        axisLine: {
          lineStyle: {
            color: '#4B5563'
          }
        },
        axisLabel: {
          color: '#9CA3AF',
          rotate: 30,
          fontSize: 11
        },
        axisTick: {
          alignWithLabel: true
        }
      },
      yAxis: {
        type: 'value',
        axisLine: {
          show: false
        },
        axisLabel: {
          color: '#9CA3AF'
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(75, 85, 99, 0.3)'
          }
        }
      },
      series: [
        {
          name: 'Inscritos',
          type: 'bar',
          data: uniqueEvents.map(item => [this.truncateString(item[0], 15), item[1], item[2]]),
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(16, 185, 129, 0.8)' },
              { offset: 1, color: 'rgba(5, 150, 105, 0.8)' }
            ]),
            borderRadius: [4, 4, 0, 0],
            shadowColor: 'rgba(5, 150, 105, 0.3)',
            shadowBlur: 8,
            shadowOffsetY: 4
          },
          emphasis: {
            itemStyle: {
              shadowColor: 'rgba(5, 150, 105, 0.5)',
              shadowBlur: 16
            }
          },
          label: {
            show: true,
            position: 'top',
            color: '#E5E7EB',
            formatter: '{c}'
          }
        },
        {
          name: 'Capacidad',
          type: 'bar',
          data: uniqueEvents.map(item => [this.truncateString(item[0], 15), item[2]]),
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(239, 68, 68, 0.8)' },
              { offset: 1, color: 'rgba(220, 38, 38, 0.8)' }
            ]),
            borderRadius: [4, 4, 0, 0],
            shadowColor: 'rgba(220, 38, 38, 0.3)',
            shadowBlur: 8,
            shadowOffsetY: 4
          },
          emphasis: {
            itemStyle: {
              shadowColor: 'rgba(220, 38, 38, 0.5)',
              shadowBlur: 16
            }
          },
          label: {
            show: true,
            position: 'top',
            color: '#E5E7EB',
            formatter: '{c}'
          }
        }
      ]
    };
  }

  // Métodos auxiliares
  calculatePercentage(inscritos: number, capacidad: number): number {
    return capacidad > 0 ? (inscritos / capacidad) * 100 : 0;
  }

  getPercentage(item: any): number {
    return this.calculatePercentage(item[1], item[2]);
  }

  getEventStatusColor(item: any): string {
    const percentage = this.getPercentage(item);
    if (percentage > 90) return 'bg-red-500';
    if (percentage > 70) return 'bg-yellow-500';
    return 'bg-green-500';
  }

  truncateString(str: string, maxLength: number): string {
    return str.length > maxLength ? str.substring(0, maxLength) + '...' : str;
  }

  refreshStats(): void {
    this.loadStats();
  }

  viewEventDetails(row: any): void {
    // Implementar navegación a detalles del evento
    console.log('View event details:', row);
  }
  downloadChart(chartType: 'events' | 'participation'): void {
    try {
      const chartInstance = chartType === 'events' 
        ? this.getChartInstance('eventsByMonthChart')
        : this.getChartInstance('participationChart');
      
      if (!chartInstance) {
        console.error('Chart instance not found');
        return;
      }

      const imageUrl = chartInstance.getDataURL({
        type: 'png',
        pixelRatio: 2,
        backgroundColor: '#111827'
      });

      this.downloadImage(imageUrl, `${chartType}-chart-${new Date().toISOString().slice(0,10)}.png`);
    } catch (error) {
      console.error('Error downloading chart:', error);
    }
  }

  downloadData(chartType: 'events' | 'participation'): void {
    try {
      let csvContent = '';
      const filename = `${chartType}-data-${new Date().toISOString().slice(0,10)}.csv`;
      
      if (chartType === 'events') {
        csvContent = this.convertToCSV(
          this.eventosPorMes.map(item => ({ Mes: item[0], Eventos: item[1] })),
          ['Mes', 'Eventos']
        );
      } else {
        csvContent = this.convertToCSV(
          this.participacionEventos.map(item => ({
            Evento: item[0],
            Inscritos: item[1],
            Capacidad: item[2],
            Ocupación: `${this.calculatePercentage(item[1], item[2])}%`
          })),
          ['Evento', 'Inscritos', 'Capacidad', 'Ocupación']
        );
      }

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, filename);
    } catch (error) {
      console.error('Error downloading data:', error);
    }
  }

  private getChartInstance(chartId: string): any {
    // Necesitarás agregar un ID a tus elementos chart en el HTML
    const chartElement = document.getElementById(chartId);
    return chartElement ? echarts.getInstanceByDom(chartElement) : null;
  }

  private downloadImage(imageUrl: string, filename: string): void {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  private convertToCSV(data: any[], headers: string[]): string {
    const csvRows = [];
    
    // Headers
    csvRows.push(headers.join(','));
    
    // Data
    for (const row of data) {
      const values = headers.map(header => {
        const escaped = (''+row[header]).replace(/"/g, '\\"');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }
    
    return csvRows.join('\n');
  }
}