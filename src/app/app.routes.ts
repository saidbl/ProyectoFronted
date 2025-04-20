import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { DeportistaMainComponent } from './pages/deportista-main/deportista-main.component';
import { OrganizacionMainComponent } from './pages/organizacion-main/organizacion-main.component';
import { InstructorMainComponent } from './pages/instructor-main/instructor-main.component';
import { RutinaMComponent } from './pages/instructor-main/rutina-m/rutina-m.component';
import { RutinaDeportistaComponent } from './pages/instructor-main/rutina-deportista/rutina-deportista.component';
import { EquiposComponent } from './pages/instructor-main/equipos/equipos.component';
import { EventoEquipoComponent } from './pages/instructor-main/evento-equipo/evento-equipo.component';
import { VideosComponent } from './pages/instructor-main/rutina-m/videos/videos.component';
import { EjerciciosComponent } from './pages/instructor-main/rutina-m/ejercicios/ejercicios.component';
import { RutinasDepComponent } from './pages/deportista-main/rutinas-dep/rutinas-dep.component';
import { CheckComponent } from './pages/deportista-main/check/check.component';
import { CompletadasComponent } from './pages/deportista-main/check/completadas/completadas.component';
import { EquiposDeportistaComponent } from './pages/deportista-main/equipos-deportista/equipos-deportista.component';
import { CrearEventoComponent } from './pages/organizacion-main/crear-evento/crear-evento.component';


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
    { path: 'deportista/rutinas', component: RutinasDepComponent},
    { path: 'deportista/check', component: CheckComponent},
    { path: 'deportista/check/completadas', component: CompletadasComponent},
    { path: 'deportista/equipos', component: EquiposDeportistaComponent},
    { path: 'organizacion/eventos', component: CrearEventoComponent},
    { path: '', redirectTo: '/rutinas', pathMatch: 'full' },
    { path: '**', component:LoginComponent },
];
