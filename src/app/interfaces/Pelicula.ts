export interface Pelicula {
  id: number;
  titulo: string;
  sinopsis : string;
  duracion_min: number;
  puntuacion: string;
  poster: string;
  clasificacion_edad:string;
  generos: {
    genero: { nombre: string }
  }[];
  funciones: {
    id: number;
    fecha_hora_inicio: string;
    formato: string;
    idioma: string;
    precio: number;
    sala_id: number;
  }[];
}