import { Component, inject, OnInit, signal } from '@angular/core';
import { Auth } from '../../servicios/auth';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HistorialAgrupado } from '../../interfaces/historial';

@Component({
  imports: [DatePipe,RouterLink],
  selector: 'app-historial-funciones',
  styleUrl: './historial-funciones.css',
  templateUrl: './historial-funciones.html',
})
export class HistorialFunciones implements OnInit {
  historial = signal<HistorialAgrupado[]>([]);
  auth= inject(Auth);
  usuarioIdActual : number  = 0; 

  async ngOnInit(): Promise<void> {
    await this.cargarDatos();
  }

  async cargarDatos(): Promise<void>{ 

    this.usuarioIdActual = await this.auth.getId()
    const { data, error } = await this.auth.supabase
      .from('historial_funciones')
      .select(`
        id,
        created_at,
        codigo_asiento, 
        funciones (
          id,
          fecha_hora_inicio,
          formato,
          idioma,
          precio,
          estado,
          peliculas (
            titulo,
            poster,
            duracion_min
          )
        )
      `)
      .eq('id_usuario', this.usuarioIdActual)
      .order('created_at', { ascending: false });
        // Ordenamos de manera descendente
    console.log(data);
    if (error || !data) {
      console.error('Error al cargar:', error?.message);
      return;
    }

    const datosAgrupados = data.reduce((acumulador: any, filaActual: any) => {
      // Usamos el ID de la función como llave (key) para agrupar
      const idFuncion = filaActual.funciones.id;

      // Si es la primera vez que vemos esta función, la creamos en el acumulador
      if (!acumulador[idFuncion]) {
        acumulador[idFuncion] = {
          funcion_id: idFuncion,
          created_at: filaActual.created_at,
          asientos: [], // Inicializamos el array vacío
          precio_total: 0,
          funciones: filaActual.funciones
        };
      }

      // Agregamos el asiento al array y sumamos el precio
      if (filaActual.codigo_asiento) {
        acumulador[idFuncion].asientos.push(filaActual.codigo_asiento);
      }
      acumulador[idFuncion].precio_total += filaActual.funciones.precio;

      return acumulador;
    }, {});

    // Object.values convierte el objeto agrupado de vuelta en un array normal
    const historialFinal = Object.values(datosAgrupados) as HistorialAgrupado[];
    
    // Lo ordenamos por fecha de compra (el más reciente primero)
    historialFinal.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    this.historial.set(historialFinal);
  }
}
