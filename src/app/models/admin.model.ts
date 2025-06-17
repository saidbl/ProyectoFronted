export interface Admin{
    id:number;

    nombre:string;

    email:string;

    password:string;

    estado:boolean;

    fechaCreacion:Date;
    
    rol:string;
}