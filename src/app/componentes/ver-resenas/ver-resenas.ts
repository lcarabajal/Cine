import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ver-resenas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ver-resenas.html',
  styleUrls: ['./ver-resenas.css']
})
export class VerResenas {
  // Recibimos los datos desde el catálogo
  @Input() tituloPelicula: string = '';
  @Input() resenas: any[] = [];
  
  // Evento para cerrar el modal
  @Output() cerrar = new EventEmitter<void>();
}