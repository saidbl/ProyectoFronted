import { inject } from "@angular/core";
import { CanActivateFn,Router} from "@angular/router";
import { OrganizacionService } from "./app/services/organizacion.service";
import { InstructorService } from "./app/services/instructor.service";
import { DeportistaService } from "./app/services/deportista.service";

export const orgGuard: CanActivateFn=(route,state)=>{
    if(inject(OrganizacionService).isAuthenticated()){
        return true
    }else{
        inject(Router).navigate(['/login'])
        return false
    }
}

export const instGuard: CanActivateFn=(route,state)=>{
    if(inject(InstructorService).isInstructor()){
        return true
    }else{
        inject(Router).navigate(['/login'])
        return false
    }
}

export const depGuard: CanActivateFn=(route,state)=>{
    if(inject(DeportistaService).isDeportista()){
        return true
    }else{
        inject(Router).navigate(['/login'])
        return false
    }
}