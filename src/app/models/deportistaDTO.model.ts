export interface DeportistaDTO {
  id?: number;
  email: string;
  password?: string;
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  telefono: string;
  direccion: string;
  rol?: string; 
  genero?: string;
  estatura?: number;
  peso?: number;
  fechaRegistro?: string; 
  activo?: boolean;
  idDeporte: number;
  idInstructor: number;
  idPosicion: number;
  fotoPerfil?: string;
}