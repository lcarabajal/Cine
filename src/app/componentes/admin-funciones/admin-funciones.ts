import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Auth } from '../../servicios/auth';
import { Pelicula } from '../../interfaces/Pelicula';
import { Sala } from '../../interfaces/sala';
import { CustomDatepicker } from '../custom-datepicker/custom-datepicker';

@Component({
  selector: 'app-admin-funciones',
  imports: [CommonModule, ReactiveFormsModule,CustomDatepicker],
  templateUrl: './admin-funciones.html',
  styleUrls: ['./admin-funciones.css']
})
export class AdminFunciones implements OnInit {
  private fb = inject(FormBuilder);

  funcionForm: FormGroup;
  peliculas = signal<Pelicula[]>([]);
  salas = signal<Sala[]>([]);
  

  mostrarPicker = signal(false);
  fechaElegida = signal<Date | null>(null);

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

 
  alCambiarSala(event: any) {
    const idSala = Number(event.target.value);
    this.actualizarFormato(idSala);
  }

  // 1. Nueva función para el botón aleatorio
  elegirSalaAleatoria() {
    // Genera un número entero aleatorio entre 1 y 4
    const salaRandom = Math.floor(Math.random() * 4) + 1;

   
    this.funcionForm.patchValue({
      sala_id: salaRandom.toString()
    });

    this.actualizarFormato(salaRandom);
  }

  private actualizarFormato(idSala: number) {
    let formatoAsignado = '';
    
    switch (idSala) {
      case 1: formatoAsignado = '2D'; break;
      case 2: formatoAsignado = '3D'; break;
      case 3: formatoAsignado = '4D'; break;
      case 4: formatoAsignado = '5D'; break;
      default: formatoAsignado = '2D'; break;
    }

    this.funcionForm.patchValue({
      formato: formatoAsignado
    });
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

  
  onFechaConfirmada(fechaCompleta: Date) {
    // 1. Guardamos el dato en el Signal (como ya lo tenías)
    this.fechaElegida.set(fechaCompleta);

    // 2. Desarmamos el objeto Date que recibimos del componente
    const anio = fechaCompleta.getFullYear();
    const mes = String(fechaCompleta.getMonth() + 1).padStart(2, '0');
    const dia = String(fechaCompleta.getDate()).padStart(2, '0');
    const fechaSQL = `${anio}-${mes}-${dia}`; 

    const horas = String(fechaCompleta.getHours()).padStart(2, '0');
    const minutos = String(fechaCompleta.getMinutes()).padStart(2, '0');
    const horaSQL = `${horas}:${minutos}`; 

    // 3. Inyectamos los datos desarmados en los controles exactos de tu formulario
    this.funcionForm.patchValue({
      fecha: fechaSQL,
      hora_inicio: horaSQL
    });
    
    // 4. Le avisamos al formulario que estos campos ya fueron completados
    this.funcionForm.get('fecha')?.markAsDirty();
    this.funcionForm.get('hora_inicio')?.markAsDirty();
  }

  async onSubmit(): Promise<void> {
    console.log('¿Formulario Válido?:', this.funcionForm.valid);
    console.log('Datos actuales:', this.funcionForm.value);
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
      console.log(errConsulta);
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
      
      
      return;
    }

    const id_admin = await this.auth.getId();

    console.log(id_admin);

    // 5. Inserción si todo es válido
    const { error: errInsert } = await this.auth.supabase.from('funciones').insert({
      pelicula_id: values.pelicula_id,
      sala_id: values.sala_id,
      fecha_hora_inicio: inicio.toISOString(),
      fecha_hora_fin: fin.toISOString(),
      formato: values.formato,
      idioma: values.idioma,
      precio: values.precio,
      id_admin: id_admin
    });

    this.isLoading = false;

    if (errInsert) {
      this.mensajeError.set('Ocurrió un error al guardar la función.');
    } else {
      this.mensajeExito.set('Función programada exitosamente.');
      this.funcionForm.reset({ formato: '2D', idioma: 'Castellano' });

      this.auth.registrarAuditoria(
        'Creacion de funcion nueva', 
        `Se Creo una nueva función`
      );
    }

  }
}