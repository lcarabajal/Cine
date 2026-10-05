import { Component, OnInit, inject, signal} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Auth } from '../../servicios/auth';
import { Genero } from '../../interfaces/genero';
import { RouterLink } from '@angular/router';


@Component({
  selector: 'app-admin-peliculas',
  imports: [CommonModule,ReactiveFormsModule,RouterLink],
  templateUrl: './admin-peliculas.html',
  styleUrls: ['./admin-peliculas.css']
})
export class AdminPeliculas implements OnInit {
  private fb = inject(FormBuilder);

  peliculaForm: FormGroup;
  generosDisponibles = signal<Genero[]>([]);

  isLoading = false;
  mensajeError: string | null = null;
  mensajeExito: string | null = null;

  constructor(private auth:Auth) {
    this.peliculaForm = this.fb.group({
      titulo: ['', Validators.required],
      sinopsis: ['', Validators.required],
      duracion_min: ['', [Validators.required, Validators.min(1)]],
      poster: ['', Validators.required],
      puntuacion: ['', [Validators.required, Validators.min(0), Validators.max(10)]],
      clasificacion_edad: ['ATP', Validators.required],
      proximamente: [true],
      generos_seleccionados: [[], Validators.required] 
    });
  }


  async ngOnInit(): Promise<void> {
    await this.cargarGeneros();
  }

  async cargarGeneros(): Promise<void> {
    const { data, error } = await this.auth.supabase.from('generos').select('*').order('nombre');
    if (!error && data) {
      this.generosDisponibles.set(data as Genero[]);
    }
  }

  esCampoInvalido(nombreCampo:string): boolean {
    const campo = this.peliculaForm.get(nombreCampo);
    return !!(campo?.invalid && campo.touched)
  }

  async onSubmit(): Promise<void> {
    if (this.peliculaForm.invalid) {
      this.peliculaForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.mensajeError = null;
    this.mensajeExito = null;

    const values = this.peliculaForm.value;

    // 1. Insertar la película y devolver el registro creado (.select().single())
    const { data: nuevaPelicula, error: errPelicula } = await this.auth.supabase
      .from('peliculas')
      .insert({
        titulo: values.titulo,
        sinopsis: values.sinopsis,
        duracion_min: values.duracion_min,
        poster: values.poster,
        puntuacion: values.puntuacion,
        clasificacion_edad: values.clasificacion_edad,
        proximamente:values.proximamente
      })
      .select('id')
      .single();

    if (errPelicula || !nuevaPelicula) {
      this.mensajeError = `Error al guardar la película: ${errPelicula?.message}`;
      this.isLoading = false;
      return;
    }

    // 2. Preparar el array para la tabla intermedia pelicula_generos
    const relacionesGeneros = values.generos_seleccionados.map((generoId: string) => ({
      pelicula_id: nuevaPelicula.id,
      genero_id: Number(generoId)
    }));

    // 3. Insertar los géneros relacionados
    const { error: errGeneros } = await this.auth.supabase
      .from('pelicula_generos')
      .insert(relacionesGeneros);

    this.isLoading = false;

    if (errGeneros) {
      this.mensajeError = 'Película creada, pero ocurrió un error al asignar los géneros.';
    } else {
      this.mensajeExito = 'Película guardada exitosamente con sus géneros.';
      this.peliculaForm.reset({ clasificacion_edad: 'ATP', generos_seleccionados: [] });
    }
  }
}