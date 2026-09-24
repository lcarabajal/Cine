import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { Pelicula } from '../../interfaces/Pelicula';
import { DuracionHorasPipe } from '../../pipes/duracion-horas-pipe';
import { Auth } from '../../servicios/auth';
import { DatePipe } from '@angular/common';
import { SalaCine } from '../sala-cine/sala-cine';

@Component({
  imports: [DuracionHorasPipe, DatePipe, SalaCine],
  selector: 'app-catalogo-peliculas',
  styleUrl: './catalogo-peliculas.css',
  templateUrl: './catalogo-peliculas.html',
})
export class CatalogoPeliculas implements OnInit{
  auth = inject(Auth);
  filtroGenero = input<string>('');
  peliculas = signal<Pelicula[]>([]);
  funcionSeleccionada = signal<number | null>(null);

  //es una señal computada reactiva y memoizada que genera una señal derivada de solo lectura
  peliculasFiltradas = computed(() => {
    const cola = this.filtroGenero().trim().toLowerCase();
    if (!cola) return this.peliculas();

    return this.peliculas().filter(p =>
      p.generos.some(g => 
        g.genero.nombre.toLowerCase().includes(cola)
      )
    );
  });

  async ngOnInit(): Promise<void> {
    const { data, error } = await this.auth.supabase
      .from('peliculas')
      .select(`
        id,
        titulo,
        duracion_min,
        poster,
        puntuacion,
        generos:pelicula_generos (
          genero:generos ( nombre )
        ),
        funciones!inner (
          id,
          fecha_hora_inicio,
          formato,
          idioma,
          precio,
          sala_id,
          estado
        )
      `)
      .eq('funciones.estado', 'libre');

    if (error) {
      console.error('Error al cargar datos:', error.message);
      return;
    }

    this.peliculas.set(data as unknown as Pelicula[]) ?? [];
    console.log("Estos son las peliculas");
    console.log(this.peliculas());
  }

  abrirSala(idFuncion: number): void {
    this.funcionSeleccionada.set(idFuncion);
  }

  cerrarSala(): void {
    this.funcionSeleccionada.set(null);
  }
}
