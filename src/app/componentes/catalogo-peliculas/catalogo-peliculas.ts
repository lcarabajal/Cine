import { Component, computed, ElementRef, inject, input, OnInit, signal, ViewChild } from '@angular/core';
import { Pelicula } from '../../interfaces/Pelicula';
import { Auth } from '../../servicios/auth';
import { DatePipe } from '@angular/common';
import { SalaCine } from '../sala-cine/sala-cine';
import { DuracionHorasPipe } from '../../pipes/duracion-horas-pipe';
import { PromedioResenasPipe } from '../../pipes/promedio-resenas-pipe';
import { VerResenas } from '../ver-resenas/ver-resenas';

@Component({
  imports: [DatePipe,VerResenas, SalaCine, DuracionHorasPipe, PromedioResenasPipe],
  standalone:true,
  selector: 'app-catalogo-peliculas',
  styleUrl: './catalogo-peliculas.css',
  templateUrl: './catalogo-peliculas.html',
})
export class CatalogoPeliculas implements OnInit{
  auth = inject(Auth);
  
  filtroGenero = input<string>('');
  peliculas = signal<Pelicula[]>([]);
  peliculasTop = signal<Pelicula[]>([]);
  funcionSeleccionada = signal<number | null>(null);
  tituloSeleccionado = signal<string>('');
  fechaSeleccionada = signal<string>('');
  precioSeleccionado = signal<number>(0);
  mostrarSala = signal<boolean>(false);
  salaIdSeleccionado= signal<number | null>(null);

  mostrarModalResenas = signal<boolean>(false);
  resenasOverlay = signal<any[]>([]);
  tituloOverlay = signal<string>('');
  
  @ViewChild('carrusel') carruselRef!: ElementRef;

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

  requiereAdulto(clasificacion: string): boolean {
    if (!clasificacion) return false;
    // Convierte a minúsculas y busca si incluye "18"
    return clasificacion.toLowerCase().includes('18'); 
  }

  async ngOnInit(): Promise<void> {

    const { data, error } = await this.auth.supabase
      .from('peliculas')
      .select(`
        id,
        titulo,
        duracion_min,
        poster,
        puntuacion,
        proximamente,
        clasificacion_edad,
        generos:pelicula_generos (
          genero:generos ( nombre )
        ),
        funciones (
          id,
          fecha_hora_inicio,
          formato,
          idioma,
          precio,
          sala_id,
          estado
        ),
        resenas (
          puntuacion,
          comentario
        )
      `)
      .eq('funciones.estado', 'libre');

    if (error) {
      console.error('Error al cargar datos:', error.message);
      return;
    }

    this.peliculas.set(data as unknown as Pelicula[]) ?? [];
    this.cargarPeliculasMasVendidas();
  }

  async cargarPeliculasMasVendidas() {
    // 1. Traemos el historial completo cruzando hasta la tabla películas
    const { data, error } = await this.auth.supabase
      .from('historial_funciones')
      .select(`
        funciones (
          peliculas (
            id,
            titulo,
            poster,
            sinopsis,
            duracion_min,
            clasificacion_edad
          )
        )
      `);

    if (error) {
      console.error('Error al cargar top películas:', error);
      return;
    }

    if (data) {
      // 2. Diccionario para agrupar las películas por su ID
      // Guardaremos la info de la película y un contador de tickets
      const conteoPeliculas: { [idPelicula: number]: { infoPeli: any, tickets: number } } = {};

      data.forEach((fila: any) => {
        const pelicula = fila.funciones?.peliculas;
        
        if (pelicula) {
          if (!conteoPeliculas[pelicula.id]) {
            // Si es la primera vez que la vemos, la agregamos al diccionario
            conteoPeliculas[pelicula.id] = { infoPeli: pelicula, tickets: 0 };
          }
          // Sumamos 1 ticket vendido a esta película
          conteoPeliculas[pelicula.id].tickets++;
        }
      });

      // 3. Convertir el diccionario en un Array, ordenarlo de mayor a menor y tomar las 5 primeras
      const ranking = Object.values(conteoPeliculas)
        .sort((a, b) => b.tickets - a.tickets) // Orden descendente
        .slice(0, 3) // Nos quedamos solo con el Top 3
        .map(item => ({
          ...item.infoPeli, // Esparcimos los datos (id, titulo, poster, etc.)
          ticketsVendidos: item.tickets // Agregamos este dato extra por si lo queremos mostrar
        }));

      // 4. Guardamos en la señal para que el HTML la dibuje
      this.peliculasTop.set(ranking);
    }
  }

  moverCarrusel(direccion: number): void {
    if (this.carruselRef) {
      const contenedor = this.carruselRef.nativeElement;
      // Ajusta este 320 según el ancho de tu tarjeta + el espacio (gap)
      const distanciaDesplazamiento = 320; 
      
      contenedor.scrollBy({ 
        left: distanciaDesplazamiento * direccion, 
        behavior: 'smooth' // Movimiento suave
      });
    }
  }

  abrirSala(funcionId: number, titulo: string, fecha: string, precio: number,sala_id:number): void {
    this.funcionSeleccionada.set(funcionId); 
    
    // Guardamos los datos nuevos
    this.tituloSeleccionado.set(titulo);
    this.fechaSeleccionada.set(fecha);
    this.precioSeleccionado.set(precio);
    this.salaIdSeleccionado.set(sala_id);
    
    // Abrimos el modal
    this.mostrarSala.set(true); 
  }

  cerrarSala(): void {
    this.funcionSeleccionada.set(null);
  }

  abrirOpiniones(titulo: string, resenas: any[]) {
    this.tituloOverlay.set(titulo);
    this.resenasOverlay.set(resenas || []);
    this.mostrarModalResenas.set(true);
  }
}
