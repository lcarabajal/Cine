import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'promedioResenas',
})
export class PromedioResenasPipe implements PipeTransform {
  transform(resenas: any[]): string | number {
    // Si no hay reseñas, devolvemos un texto por defecto
    if (!resenas || resenas.length === 0) {
      return 'Sin reseñas';
    }

    // Sumamos todas las puntuaciones
    const suma = resenas.reduce((acumulador, resena) => acumulador + Number(resena.puntuacion), 0);
    
    // Calculamos el promedio
    const promedio = suma / resenas.length;

    // Devolvemos el número con 1 solo decimal (ej: 8.5)
    return promedio.toFixed(1);
  }
}