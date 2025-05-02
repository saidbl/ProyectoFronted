import { Component, OnInit ,inject} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TipoMetricaDTO } from '../../../models/tipoMetricaDTO.model';
import { TipoMetricaService } from '../../../services/tipoMetrica.service';
import { TipoMetrica } from '../../../models/tipoMetrica.model';
import { RegistroRendimientoDTO } from '../../../models/registroRendimientoDTO.model';
import { RegistroRendimientoService } from '../../../services/registroRendimiento.service';
import { RegistroRendimiento } from '../../../models/registroRendimiento.model';
import { forkJoin } from 'rxjs';
import { ObjetivoRendimientoDTO } from '../../../models/objetivoRendimientoDTO.model';
import { ObjetivoRendimiento } from '../../../models/objetivoRendimiento.model';
import { ObjetivoRendimientoService } from '../../../services/objetivoRendimiento.service';

@Component({
  selector: 'app-rendimiento',
  imports: [FormsModule,CommonModule,ReactiveFormsModule,MatTooltipModule],
  templateUrl: './rendimiento.component.html',
  styleUrl: './rendimiento.component.css'
})
export class RendimientoComponent implements OnInit{
  private tmservice = inject(TipoMetricaService)
  private rrservice = inject(RegistroRendimientoService)
  private orservice= inject (ObjetivoRendimientoService)
  currentView: 'metrics' | 'records' | 'goals' = 'metrics';
  showrendimientoForm= false
  showgoalsForm= false
  loading = true;
  metricForm: FormGroup ;
  recordForm: FormGroup;
  goalForm: FormGroup;
  sports: any[] = [];
  metrics: TipoMetrica[] = [];
  athleteMetrics: any[] = [];
  records: RegistroRendimiento[] = [];
  goals: ObjetivoRendimiento[] = [];
  filteredRecords: any[] = [];
  athleteProfile: any;
  selectedMetric: any = null;
  dateRange = { start: "12/11/2025", end: "24/01/2026" };
  performanceChart: any;
  showmetricaForm: boolean =false
  constructor(
    private fb: FormBuilder,
  ) {
    this.metricForm = this.fb.group({
      nombre: ['', Validators.required],
      unidad: ['', Validators.required],
      esObjetivo: [false]
    });
    this.recordForm = this.fb.group({
      idmetrica: [null, Validators.required],
      valor: ['', [Validators.required, Validators.min(0)]],
      fecha: [new Date(), Validators.required],
      comentarios: ['']
    });
    this.goalForm = this.fb.group({
      idmetrica: ['', Validators.required],
      valorObjetivo: ['', [Validators.required, Validators.min(0)]],
      fechaObjetivo: ['', Validators.required],
      prioridad: [1, [Validators.min(1), Validators.max(5)]],
    });
  }

  ngOnInit(): void {
    this.loadInitialData();
  }

  mostrarFormRendimiento(){
    this.showrendimientoForm= true
  }
  mostrarFormMetrica(){
    this.showmetricaForm=true
  }
  mostrarFormObjetivos(){
    this.showgoalsForm=true
  }
  cancelar(){
    this.showmetricaForm=false
  }
  loadInitialData() {
    const token =localStorage.getItem("token")
    const id = localStorage.getItem("id")
    if(!token) {
      throw new Error("Not Token Found")
    }
    forkJoin({
                metrics: this.tmservice.list(Number(id), token),
                records: this.rrservice.list(Number(id), token),
                goals : this.orservice.list(Number(id),token)
              }).subscribe({
                next: (data) => {
                  this.metrics = data.metrics;
                  this.records = data.records;
                  this.goals = data.goals
                  this.loading= false
                },
                error: (err) => {
                  console.error("Error loading data", err);
                  this.loading=false
                }
              });
  }

  filterRecords(): void {
    this.filteredRecords = [...this.records];
    
    if (this.selectedMetric) {
      this.filteredRecords = this.filteredRecords.filter(r => r.metricId === this.selectedMetric.id);
    }
    
    if (this.dateRange.start && this.dateRange.end) {
      this.filteredRecords = this.filteredRecords.filter(r => {
        const recordDate = new Date(r.date);
        return recordDate >= new Date(this.dateRange.start) && 
               recordDate <= new Date(this.dateRange.end);
      });
    }
  }

  async addMetric(){
    const token =localStorage.getItem("token")
    if(!token) {
      throw new Error("Not Token Found")
    }
    if (this.metricForm.invalid) return;
    const newMetric : TipoMetricaDTO= this.metricForm.value
    newMetric.iddeporte = Number(localStorage.getItem("idDeporte"))
    newMetric.iddeportista = Number(localStorage.getItem("id"))
    console.log(newMetric)
    this.tmservice.add(newMetric,token).subscribe({
      next:(data)=>{
        console.log(data)

      },
      error:(err)=>{
        console.error(err)
      }
    })
  }

  async addRecord(){
    console.log("hola")
    const token =localStorage.getItem("token")
    if(!token) {
      throw new Error("Not Token Found")
    }
    console.log("hola")
    if (this.recordForm.invalid) return;
    console.log("hola")
    const newRecord : RegistroRendimientoDTO= this.recordForm.value
    newRecord.iddeportista = Number(localStorage.getItem("id"))
    console.log(newRecord)
    this.rrservice.add(newRecord,token).subscribe({
      next:(data)=>{
        console.log(data)

      },
      error:(err)=>{
        console.error(err)
      }
    })
  }

  async addGoal(){
    console.log("hola")
    const token =localStorage.getItem("token")
    if(!token) {
      throw new Error("Not Token Found")
    }
    if (this.goalForm.invalid) return;
    const newGoal : ObjetivoRendimientoDTO= this.goalForm.value
    newGoal.iddeportista = Number(localStorage.getItem("id"))
    this.orservice.add(newGoal,token).subscribe({
      next:(data)=>{
        console.log(data)

      },
      error:(err)=>{
        console.error(err)
      }
    })
  }

  toggleGoalCompletion(goal: any): void {
  }

  deleteItem(type: 'metric' | 'record' | 'goal', id: number): void {

  }

  showSuccess(message: string): void {
  }

  // Métodos de simulación de API
  private async getSports(): Promise<any[]> {
    return [
      { id: 1, name: 'Fútbol', type: 'Equipo' },
      { id: 2, name: 'Baloncesto', type: 'Equipo' },
      { id: 3, name: 'Vóleybol', type: 'Equipo' }
    ];
  }

  private async getMetrics(): Promise<any[]> {
    return [
      { id: 1, name: 'Velocidad 40m', unit: 'seg', sportId: 1, isGoal: true },
      { id: 2, name: 'Salto vertical', unit: 'cm', sportId: 1, isGoal: true },
      { id: 3, name: 'Resistencia', unit: 'min', sportId: 1, isGoal: true },
      { id: 4, name: 'Precisión de tiro', unit: '%', sportId: 2, isGoal: true },
      { id: 5, name: 'Fuerza piernas', unit: 'kg', sportId: 1, isGoal: false }
    ];
  }

  private async getRecords(): Promise<any[]> {
    const today = new Date();
    const records = [];
    for (let i = 0; i < 5; i++) {
      const date = new Date();
      date.setMonth(today.getMonth() - (4 - i));
      records.push({
        id: i + 1,
        athleteId: 1,
        metricId: 1,
        value: +(6.5 - (i * 0.2)).toFixed(1),
        date: date.toISOString().split('T')[0],
        comments: i === 4 ? 'Mejor marca personal' : ''
      });
    }
    
    return records;
  }

  private async getGoals(): Promise<any[]> {
    return [
      {
        id: 1,
        athleteId: 1,
        metricId: 1,
        metricName: 'Velocidad 40m',
        targetValue: 5.8,
        targetDate: '2024-12-31',
        establishedDate: '2024-01-15',
        completed: false,
        priority: 1,
        comments: 'Objetivo para fin de temporada'
      },
      {
        id: 2,
        athleteId: 1,
        metricId: 2,
        metricName: 'Salto vertical',
        targetValue: 65,
        targetDate: '2024-10-01',
        establishedDate: '2024-02-20',
        completed: false,
        priority: 2,
        comments: 'Mejorar capacidad de salto'
      }
    ];
  }
}
