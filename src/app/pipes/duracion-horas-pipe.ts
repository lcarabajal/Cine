import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'duracionHoras',
})
export class DuracionHorasPipe implements PipeTransform {
  transform(minutos: number | null | undefined): string {
    if(minutos === null || minutos == undefined || isNaN(minutos) || minutos < 0){
      return '0m';
    }

    //Obtengo la parte entera de las horas descartando decimales de la division 
    const horas = Math.floor(minutos/60);
    //Obtengo el residuo exacto que corresponde a los minutos sobrantes
    const minutosRestantes = minutos % 60; 

    //Si llega a ser 0 se pasa solo los minutos y viceversa
    if(horas === 0){
      return `${minutosRestantes}`
    }

    if(minutosRestantes === 0){
      return `${horas}h`;
    }

    return `${horas}h ${minutosRestantes}m`;
  }
}
