import { Component, OnInit, Output, EventEmitter, signal, computed, input, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-custom-datepicker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './custom-datepicker.html',
  styleUrls: ['./custom-datepicker.css']
})
export class CustomDatepicker implements OnInit {
  @Output() fechaConfirmada = new EventEmitter<Date>();
  @Output() cerrar = new EventEmitter<void>();
  @Input() mostrarHorario: boolean = true;

  // Fecha base para navegar por los meses
  fechaNavegacion = signal(new Date());
  
  // Lo que el usuario va seleccionando
  diaSeleccionado = signal<number | null>(null);
  horaSeleccionada = signal<string>('20');
  minutoSeleccionado = signal<string>('00');

  diasSemana = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'];
  meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  listaAnios: number[] = [];

  // Signal computado: genera la cuadrícula del calendario automáticamente
  calendario = computed(() => {
    const año = this.fechaNavegacion().getFullYear();
    const mes = this.fechaNavegacion().getMonth();
    
    const primerDia = new Date(año, mes, 1).getDay(); // Día de la semana que empieza el mes
    const diasEnMes = new Date(año, mes + 1, 0).getDate(); // Total de días del mes

    const dias = [];
    // Rellenar espacios en blanco antes del primer día del mes
    for (let i = 0; i < primerDia; i++) {
      dias.push(null); 
    }
    // Rellenar los días reales
    for (let i = 1; i <= diasEnMes; i++) {
      dias.push(i);
    }
    return dias;
  });

  mesAnioActual = computed(() => {
    return `${this.meses[this.fechaNavegacion().getMonth()]} ${this.fechaNavegacion().getFullYear()}`;
  });

  ngOnInit() {
    // Autoseleccionar el día de hoy al abrir
    const anioActual = new Date().getFullYear();
    for (let i = 1920; i <= anioActual + 5; i++) {
      this.listaAnios.push(i);
    }
    this.listaAnios.reverse();

    this.diaSeleccionado.set(new Date().getDate());
  }

  cambiarMes(direccion: number) {
    const nuevaFecha = new Date(this.fechaNavegacion());
    nuevaFecha.setMonth(nuevaFecha.getMonth() + direccion);
    this.fechaNavegacion.set(nuevaFecha);
    this.diaSeleccionado.set(null); // Resetea el día al cambiar de mes
  }

  

  seleccionarDia(dia: number | null) {
    if (dia !== null) {
      this.diaSeleccionado.set(dia);
    }
  }

  confirmar() {
    if (this.diaSeleccionado() === null) {
      alert('Por favor selecciona un día');
      return;
    }

    //Si no mostramos el horario, forzamos las horas y minutos a 0
    const horas = this.mostrarHorario ? parseInt(this.horaSeleccionada()) : 0;
    const minutos = this.mostrarHorario ? parseInt(this.minutoSeleccionado()) : 0;

    const fechaFinal = new Date(
      this.fechaNavegacion().getFullYear(),
      this.fechaNavegacion().getMonth(),
      this.diaSeleccionado()!,
      horas,
      minutos
    );
    

    this.fechaConfirmada.emit(fechaFinal);
    this.cerrar.emit();
  }
}