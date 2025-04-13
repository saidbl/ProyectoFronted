import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { DeportistaMainComponent } from './pages/deportista-main/deportista-main.component';
import { OrganizacionMainComponent } from './pages/organizacion-main/organizacion-main.component';
import { InstructorService } from './services/instructor.service';
import { InstructorMainComponent } from './pages/instructor-main/instructor-main.component';
import { RutinaMComponent } from './pages/instructor-main/rutina-m/rutina-m.component';
import { RutinaDeportistaComponent } from './pages/instructor-main/rutina-deportista/rutina-deportista.component';
import { EquiposComponent } from './pages/instructor-main/equipos/equipos.component';
import { EventoEquipoComponent } from './pages/instructor-main/evento-equipo/evento-equipo.component';
import { VideosComponent } from './pages/instructor-main/rutina-m/videos/videos.component';
import { EjerciciosComponent } from './pages/instructor-main/rutina-m/ejercicios/ejercicios.component';

export const routes: Routes = [
    {path:'', redirectTo:"/login",pathMatch:'full'},
    {path:'login', component:LoginComponent},
    {path:'deportista',component:DeportistaMainComponent},
    {path:'organizacion',component:OrganizacionMainComponent},
    {path:'instructor',component:InstructorMainComponent},
    { path: 'instructor/rutinas', component: RutinaMComponent },
    { path: 'instructor/rutinaDeportista', component: RutinaDeportistaComponent },
    { path: 'instructor/crearEquipos', component: EquiposComponent},
    { path: 'instructor/equipoEvento', component: EventoEquipoComponent},
    { path: 'instructor/rutinas/videos', component: VideosComponent},
    { path: 'instructor/rutinas/ejercicios', component: EjerciciosComponent},
    { path: '', redirectTo: '/rutinas', pathMatch: 'full' },
    { path: '**', component:LoginComponent },
];
