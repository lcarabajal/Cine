import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Auth } from '../../servicios/auth'; // Asegúrate de que la ruta sea correcta
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-validar-qr',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './validar-qr.html',
  styleUrls: ['./validar-qr.css']
})
export class ValidarQr implements OnInit {
  private route = inject(ActivatedRoute);
  private auth = inject(Auth);

  // Agregamos una variable para saber qué interfaz mostrar
  // Estados posibles: 'cargando' | 'valido' | 'invalido' | 'error'
  estadoValidacion = signal<'cargando' | 'valido' | 'invalido' | 'error'>('cargando');
  mensaje = signal<string>('Escaneando ticket...');
  tipoTicket = signal<'cine' | 'candy' | null>(null);
  infoCandy = signal<any[]>([]);
  
  // Guardamos la información visual para el empleado
  infoTicket = signal<any>(null);

  // Variable unida al input del HTML
  codigoManual = signal('');

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const codigoUrl = params.get('codigo');
      if (codigoUrl) {
        this.codigoManual.set(codigoUrl); // Lo ponemos en el input
        this.procesarValidacion(codigoUrl); // Validamos automáticamente
      }
    });
  }

  // Se ejecuta al hacer clic en el botón "Validar" o presionar Enter
  validarDesdeInput() {
    const codigo = this.codigoManual().trim();
    if (!codigo) {
      alert('Por favor, ingresa un código.');
      return;
    }
    this.procesarValidacion(codigo);
  }

  async procesarValidacion(codigoQr: string): Promise<void> {
    try {
      // 1. INTENTAR BUSCAR EN CINE
      const { data: dataCine } = await this.auth.supabase
        .from('historial_funciones')
        .select(`id, qr_usado, codigo_asiento, funciones ( fecha_hora_inicio, peliculas ( titulo ) )`)
        .eq('codigo_qr', codigoQr)
        .maybeSingle(); // maybeSingle no da error si no encuentra nada

      if (dataCine) {
        this.tipoTicket.set('cine');
        this.procesarResultado(dataCine, 'historial_funciones', codigoQr);
        
        const funcionInfo: any = Array.isArray(dataCine.funciones) ? dataCine.funciones[0] : dataCine.funciones;
        const peliculaInfo: any = Array.isArray(funcionInfo?.peliculas) ? funcionInfo.peliculas[0] : funcionInfo?.peliculas;
        
        this.infoTicket.set({
          pelicula: peliculaInfo?.titulo,
          fecha: funcionInfo?.fecha_hora_inicio,
          asiento: dataCine.codigo_asiento
        });
        return;
      }

      // 2. SI NO ES DE CINE, INTENTAR BUSCAR EN CANDY BAR
      const { data: dataCandy } = await this.auth.supabase
        .from('historial_candybar')
        .select('*')
        .eq('codigo_qr', codigoQr)
        .maybeSingle();

      if (dataCandy) {
        this.tipoTicket.set('candy');
        this.procesarResultado(dataCandy, 'historial_candybar', codigoQr);
        // Guardamos el JSON de los productos en el signal para mostrarlo en el HTML
        this.infoCandy.set(dataCandy.detalles);
        return;
      }

      // 3. SI NO ESTÁ EN NINGUNA TABLA
      this.estadoValidacion.set('error');
      this.mensaje.set('Ticket falso o no encontrado.');

    } catch (err) {
      this.estadoValidacion.set('error');
      this.mensaje.set('Error de conexión.');
    }
  }

  private async procesarResultado(data: any, tabla: string, codigoQr: string) {
    if (data.qr_usado === true) {
      this.estadoValidacion.set('invalido');
      this.mensaje.set('¡ALERTA! Este ticket ya fue utilizado.');
      return;
    }

    const { error } = await this.auth.supabase
      .from(tabla)
      .update({ qr_usado: true })
      .eq('codigo_qr', codigoQr);

    if (error) throw error;

    this.estadoValidacion.set('valido');
    this.mensaje.set(tabla === 'historial_candybar' ? 'Entregar Pedido' : 'Acceso Permitido');
  }

  cerrarOverlay() {
    this.estadoValidacion.set('cargando'); // Vuelve al estado inicial
    this.codigoManual.set(''); // Limpia el input para el próximo escaneo
  }
}