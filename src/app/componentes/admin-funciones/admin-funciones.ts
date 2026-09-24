import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Auth } from '../../servicios/auth';
import { Pelicula } from '../../interfaces/Pelicula';
import { Sala } from '../../interfaces/sala';

@Component({
  selector: 'app-admin-funciones',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-funciones.html',
  styleUrls: ['./admin-funciones.css']
})
export class AdminFunciones implements OnInit {
  private fb = inject(FormBuilder);

  funcionForm: FormGroup;
  peliculas = signal<Pelicula[]>([]);
  salas = signal<Sala[]>([]);
  
  isLoading = false;
  mensajeError = signal<string>('');
  mensajeExito = signal<string>('');

  constructor(private auth:Auth) {
    this.funcionForm = this.fb.group({
      pelicula_id: ['', Validators.required],
      sala_id: ['', Validators.required],
      fecha: ['', Validators.required],
      hora_inicio: ['', Validators.required],
      formato: ['2D', Validators.required],
      idioma: ['Castellano', Validators.required],
      precio: [0, [Validators.required, Validators.min(1)]]
    });
  }

  async ngOnInit(): Promise<void> {
    await this.cargarDatosBase();
  }

  // Carga los selectores iniciales
  async cargarDatosBase(): Promise<void> {
    const [reqPeliculas, reqSalas] = await Promise.all([
      this.auth.supabase.from('peliculas').select('id, titulo, duracion_min'),
      this.auth.supabase.from('salas').select('id, numero')
    ]);

    this.peliculas.set(reqPeliculas.data as Pelicula[] ?? []);
    this.salas.set(reqSalas.data as Sala[] ?? []);
  }

  esCampoInvalido(nombreCampo:string): boolean {
    const campo = this.funcionForm.get(nombreCampo);
    return !!(campo?.invalid && campo.touched)
  }

  async onSubmit(): Promise<void> {
    if (this.funcionForm.invalid) {
      this.funcionForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.mensajeError.set('');
    this.mensajeExito.set('');

    const values = this.funcionForm.value;
    const pelicula = this.peliculas().find(p => p.id == values.pelicula_id);

    if (!pelicula) return;

    //Calcular Fecha/Hora de Inicio y Fin real
    const inicio = new Date(`${values.fecha}T${values.hora_inicio}:00`);
    const fin = new Date(inicio.getTime() + pelicula.duracion_min * 60000); // Sumar duración

    //Definir rango del día para buscar funciones existentes en esa sala
    const inicioDia = new Date(inicio);
    inicioDia.setHours(0, 0, 0, 0);
    const finDia = new Date(inicioDia);
    finDia.setDate(finDia.getDate() + 1);

    //Consultar a Supabase las funciones de esa sala en ese día
    const { data: funcionesExistentes, error: errConsulta } = await this.auth.supabase
      .from('funciones')
      .select('fecha_hora_inicio, fecha_hora_fin')
      .eq('sala_id', values.sala_id)
      .gte('fecha_hora_inicio', inicioDia.toISOString())
      .lt('fecha_hora_inicio', finDia.toISOString());

    if (errConsulta) {
      this.mensajeError.set('Error al verificar disponibilidad de la sala.');
      this.isLoading = false;
      return;
    }

    //Lógica de validación: Margen de 30 minutos
    let hayConflicto = false;
    for (const func of (funcionesExistentes || [])) {
      const extInicio = new Date(func.fecha_hora_inicio);
      const extFin = new Date(func.fecha_hora_fin);

      // Calculamos el bloqueo total añadiendo 30 minutos (1.800.000 ms) al fin de cada función
      const extFinConMargen = new Date(extFin.getTime() + 30 * 60000);
      const nuevoFinConMargen = new Date(fin.getTime() + 30 * 60000);

      // Hay colisión si el InicioNuevo es ANTES del FinExistente+30m 
      // Y el FinNuevo+30m es DESPUÉS del InicioExistente
      if (inicio < extFinConMargen && nuevoFinConMargen > extInicio) {
        hayConflicto = true;
        break;
      }
    }

    if (hayConflicto) {
      this.mensajeError.set('Error: La sala está ocupada o no se respeta el margen de 30 minutos entre funciones.');
      this.isLoading = false;
      
      console.log("Esto SI deberia de llegar acá");
      console.log(this.isLoading);
      return;
    }

    // 5. Inserción si todo es válido
    const { error: errInsert } = await this.auth.supabase.from('funciones').insert({
      pelicula_id: values.pelicula_id,
      sala_id: values.sala_id,
      fecha_hora_inicio: inicio.toISOString(),
      fecha_hora_fin: fin.toISOString(),
      formato: values.formato,
      idioma: values.idioma,
      precio: values.precio
    });

    this.isLoading = false;

    if (errInsert) {
      this.mensajeError.set('Ocurrió un error al guardar la función.');
    } else {
      this.mensajeExito.set('Función programada exitosamente.');
      this.funcionForm.reset({ formato: '2D', idioma: 'Castellano' });
    }

  }
}