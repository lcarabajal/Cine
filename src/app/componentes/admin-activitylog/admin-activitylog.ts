import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Auth } from '../../servicios/auth';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-activitylog',
  standalone: true,
  imports: [CommonModule,RouterLink],
  templateUrl: './admin-activitylog.html',
  styleUrls: ['./admin-activitylog.css']
})
export class AdminActivitylog implements OnInit {
  private auth = inject(Auth);

  // Señal para almacenar el historial
  logs = signal<any[]>([]);

  ngOnInit() {
    this.cargarHistorial();
  }

  async cargarHistorial() {
    const { data, error } = await this.auth.supabase
      .from('activitylog')
      .select('*')
      .order('fecha_hora', { ascending: false }) // Los más recientes primero
      .limit(100); 

    if (error) {
      console.error('Error al cargar el historial de actividad:', error);
    } else {
      this.logs.set(data || []);
    }
  }

  // Función para darle un color distinto a la etiqueta según la acción
  obtenerClaseAccion(accion: string): string {
    const texto = accion.toLowerCase();
    
    if (texto.includes('precio') || texto.includes('modific')) return 'badge-amarillo';
    if (texto.includes('crea') || texto.includes('funcion')) return 'badge-verde';
    if (texto.includes('valid') || texto.includes('qr')) return 'badge-celeste';
    if (texto.includes('elimin') || texto.includes('denegad')) return 'badge-rojo';
    
    return 'badge-gris'; // Por defecto
  }
}