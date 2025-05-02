import { Component, OnInit ,inject} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TipoMetricaDTO } from '../../../models/tipoMetricaDTO.model';
import { TipoMetricaService } from '../../../services/tipoMetrica.service';
import { TipoMetrica } from '../../../models/tipoMetrica.model';

@Component({
  selector: 'app-rendimiento',
  imports: [FormsModule,CommonModule,ReactiveFormsModule,MatTooltipModule],
  templateUrl: './rendimiento.component.html',
  styleUrl: './rendimiento.component.css'
})
export class RendimientoComponent implements OnInit{
  private tmservice = inject(TipoMetricaService)
  currentView: 'metrics' | 'records' | 'goals' = 'metrics';
  loading = true;
  metricForm: FormGroup ;
  recordForm: FormGroup;
  goalForm: FormGroup;
  sports: any[] = [];
  metrics: TipoMetrica[] = [];
  athleteMetrics: any[] = [];
  records: any[] = [];
  goals: any[] = [];
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
      metricId: ['', Validators.required],
      value: ['', [Validators.required, Validators.min(0)]],
      date: [new Date(), Validators.required],
      comments: ['']
    });
    this.goalForm = this.fb.group({
      metricId: ['', Validators.required],
      targetValue: ['', [Validators.required, Validators.min(0)]],
      targetDate: ['', Validators.required],
      priority: [1, [Validators.min(1), Validators.max(5)]],
      comments: ['']
    });
  }

  ngOnInit(): void {
    this.loadInitialData();
  }

  mostrarFormMetrica(){
    this.showmetricaForm=true
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
    this.tmservice.list(Number(id),token).subscribe({
      next:(data)=>{
        this.metrics = data
        console.log(data)
        this.loading = false;
      },
      error:(err)=>{
        console.log(err)
        this.loading = false;
      }
    })
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

  async addRecord(): Promise<void> {
    if (this.recordForm.invalid) return;
    
    const newRecord = {
      ...this.recordForm.value,
      id: this.records.length + 1,
      athleteId: this.athleteProfile.id
    };
    
    this.records.push(newRecord);
    this.filterRecords();
    
    this.recordForm.reset({ date: new Date() });
    this.showSuccess('Registro agregado correctamente');
  }

  async addGoal(): Promise<void> {
    if (this.goalForm.invalid) return;
    
    const newGoal = {
      ...this.goalForm.value,
      id: this.goals.length + 1,
      athleteId: this.athleteProfile.id,
      establishedDate: new Date(),
      completed: false
    };
    
    this.goals.push(newGoal);
    this.goalForm.reset({ priority: 1 });
    this.showSuccess('Objetivo agregado correctamente');
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
