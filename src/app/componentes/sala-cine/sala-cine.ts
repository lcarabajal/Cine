import { Component, OnInit, Input, inject, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Fila, Asiento } from '../../interfaces/sala-asientos';
import { Auth } from '../../servicios/auth';

@Component({
  selector: 'app-sala-cine',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sala-cine.html',
  styleUrls: ['./sala-cine.css']
})
export class SalaCine implements OnInit {
  // Recibimos el ID de la función seleccionada desde la vista anterior
  @Input() funcionId!: number; 
  @Output() cerrar = new EventEmitter<void>(); 
  
  filas= signal<Fila[]>([]);
  asientosOcupadosDb: string[] = [];
  asientosSeleccionados: string[] = [];
  usuarioID: number | null = null; 
  private auth = inject(Auth);


  async ngOnInit(): Promise<void> {
    if(this.funcionId) {
      await this.cargarAsientosOcupados();
      this.usuarioID = await this.auth.getId();
    }
    this.generarSala(); 
  }


  async cargarAsientosOcupados(): Promise<void> {
    const { data, error } = await this.auth.supabase
      .from('historial_funciones')
      .select('codigo_asiento')
      .eq('id_funcion', this.funcionId)
      .not('codigo_asiento', 'is', null); // Ignorar datos viejos sin asiento

    if (!error && data) {
      // Convertimos el array de objetos a un array simple: ['A1', 'H5', 'T14']
      this.asientosOcupadosDb = data.map(reserva => reserva.codigo_asiento);
    }
  }

  //Generar la sala (Modificado para revisar si está ocupado en la BD)
  generarSala(): void {
    //Divide la cadena en subcadenas y las devuelve como array
    const letras = 'ABCDEFGHIJKLMNOPQRST'.split('');

    const filasGeneradas = letras.map((letra) => {
      let tipoColor: 'normal' | 'azul' | 'amarillo' = 'normal';
      if (['H', 'I', 'J', 'K'].includes(letra)) tipoColor = 'azul';
      else if (['R', 'S', 'T'].includes(letra)) tipoColor = 'amarillo';

      let contadorAsientos = 1;
      const crearBloque = (cantidad: number): Asiento[] => {
        return Array.from({ length: cantidad }).map(() => {
          const asientoActual = contadorAsientos++;
          const codigo = `${letra}${asientoActual}`; // Ej: "H5"
      
          return {
            id: codigo,
            numero: asientoActual,
            //Si el código está en el array de la BD, se marca ocupado
            ocupado: this.asientosOcupadosDb.includes(codigo), 
            seleccionado: false
          };
        });
      };

      return {
        letra,
        tipoColor,
        bloqueIzq: crearBloque(2),
        bloqueCentro: crearBloque(10),
        bloqueDer: crearBloque(2)
      };
    });

    this.filas.set(filasGeneradas);
  }

 
  // Selección y guardado
  toggleSeleccion(asiento: Asiento): void {
    if (asiento.ocupado) return; // Si es de otra persona, no hacer nada

    asiento.seleccionado = !asiento.seleccionado;
    
    // Mantenemos un array con lo que el usuario quiere comprar
    if (asiento.seleccionado) {
      this.asientosSeleccionados.push(asiento.id);
    } else {
      this.asientosSeleccionados = this.asientosSeleccionados.filter(id => id !== asiento.id);
    }
  }

  // Método de compra final (Llamado por un botón "Confirmar Compra")
  async confirmarCompra(usuarioId: number): Promise<void> {
    if (this.asientosSeleccionados.length === 0) return;

    // Preparamos el array para insertar múltiples filas de una vez en Supabase
    const nuevasReservas = this.asientosSeleccionados.map(codigo => ({
      id_usuario: usuarioId,
      id_funcion: this.funcionId,
      codigo_asiento: codigo
    }));

    const { error } = await this.auth.supabase
      .from('historial_funciones')
      .insert(nuevasReservas);

    if (error) {
      // Si entra aquí, probablemente alguien más compró el asiento un segundo antes (por el Constraint UNIQUE)
      alert('Error en la compra. Es posible que uno de los asientos ya haya sido reservado.');
      await this.cargarAsientosOcupados(); // Recargamos para mostrar quién nos lo robó
      this.generarSala(); // Redibujamos la sala
    } else {
      alert('¡Compra exitosa!');
      this.cerrar.emit(); 
    }
  }

  cancelar(): void {
    this.cerrar.emit();
  }

  
}