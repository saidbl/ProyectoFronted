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
import { EventosDeportistaComponent } from './pages/deportista-main/eventos-deportista/eventos-deportista.component';
import { EventosOrganizacionComponent } from './pages/organizacion-main/eventos-organizacion/eventos-organizacion.component';
import { EquipoOrgComponent } from './pages/organizacion-main/equipo-org/equipo-org.component';
import { EstadisticasOrgComponent } from './pages/organizacion-main/estadisticas-org/estadisticas-org.component';
import { ConfiguracionOrganizacionComponent } from './pages/organizacion-main/configuracion-organizacion/configuracion-organizacion.component';
import { RendimientoComponent } from './pages/deportista-main/rendimiento/rendimiento.component';
import { PerfilInstructorComponent } from './pages/instructor-main/perfil-instructor/perfil-instructor.component';
import { InstructorEstadisticasComponent } from './pages/instructor-main/instructor-estadisticas/instructor-estadisticas.component';
import { IncompletasComponent } from './pages/deportista-main/check/incompletas/incompletas.component';
import { ChatComponent } from './pages/chat/chat.component';
import { PerfilComponent } from './pages/deportista-main/perfil/perfil.component';
import { ChatDeportistaComponent } from './pages/deportista-main/chat-deportista/chat-deportista.component';
import { InstructoresControlComponent } from './pages/organizacion-main/instructores-control/instructores-control.component';
import { ChatOrganizacionComponent } from './pages/organizacion-main/chat-organizacion/chat-organizacion.component';
import { LoginadminComponent } from './pages/loginadmin/loginadmin.component';
import { RegistroOrganizacionComponent } from './pages/loginadmin/registro-organizacion/registro-organizacion.component';


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
    { path: 'instructor/perfil',component:PerfilInstructorComponent},
    { path: 'instructor/chat',component: ChatComponent},
    { path: 'instructor/reportes',component:InstructorEstadisticasComponent},
    { path: 'deportista/rutinas', component: RutinasDepComponent},
    { path: 'deportista/check', component: CheckComponent},
    { path: 'deportista/perfil', component: PerfilComponent},
    { path: 'deportista/check/completadas', component: CompletadasComponent},
    { path: 'deportista/check/incompletas', component: IncompletasComponent},
    { path: 'deportista/proximoseventos', component: EventosDeportistaComponent},
    { path: 'deportista/equipos', component: EquiposDeportistaComponent},
    { path: 'deportista/rendimiento', component: RendimientoComponent},
    { path: 'deportista/chat', component: ChatDeportistaComponent},
    { path: 'organizacion/crear-eventos', component: CrearEventoComponent},
    { path: 'organizacion/eventos', component: EventosOrganizacionComponent},
    { path: 'organizacion/equipos-org', component: EquipoOrgComponent},
    { path: 'organizacion/estadistica-org', component: EstadisticasOrgComponent},
    { path: 'organizacion/configuracionOrg', component: ConfiguracionOrganizacionComponent},
    { path: 'organizacion/instructor', component: InstructoresControlComponent},
    { path: 'admin', component:LoginadminComponent},
    { path: "registro",component:RegistroOrganizacionComponent},
    { path: 'organizacion/chat', component: ChatOrganizacionComponent},
    { path: '', redirectTo: '/rutinas', pathMatch: 'full' },
    { path: '**', component:LoginComponent },
];
