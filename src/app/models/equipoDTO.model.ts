export interface EquipoDTO{
    id?: number
    nombre?:string
    idinstructor?: number
    iddeporte : number
    maxJugadores? : number
    fechaCreacion : Date
    estado : string
    categoria : string
    jugadoresAsociados : number
}