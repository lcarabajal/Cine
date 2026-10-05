import { Injectable, signal, computed } from '@angular/core';

// Interfaces para tipar lo que guardamos
export interface TicketCarrito {
  funcionId: number;
  peliculaTitulo: string;
  fecha: string;
  asientos: string[];
  precioUnitario: number;
}

export interface CandyCarrito {
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
  imagen_url: string;
}

@Injectable({
  providedIn: 'root' // Esto hace que sea global para toda la app
})
export class CarritoService {
  // Estados (Signals)
  tickets = signal<TicketCarrito[]>([]);
  candy = signal<CandyCarrito[]>([]);

  // Estado para controlar la visibilidad del overlay
  isCarritoAbierto = signal<boolean>(false);

  // Cálculos automáticos
  totalTickets = computed(() => {
    return this.tickets().reduce((sum, t) => sum + (t.asientos.length * t.precioUnitario), 0);
  });

  totalCandy = computed(() => {
    return this.candy().reduce((sum, c) => sum + (c.precio * c.cantidad), 0);
  });

  granTotal = computed(() => this.totalTickets() + this.totalCandy());

  // --- MÉTODOS PARA MODIFICAR EL CARRITO ---

  agregarTickets(ticket: TicketCarrito) {
    // Agregamos el nuevo ticket al arreglo existente
    this.tickets.update(actuales => [...actuales, ticket]);
    console.log(this.tickets());
  }

  quitarTickets(funcionId: number) {
    this.tickets.update(actuales => actuales.filter(t => t.funcionId !== funcionId));
  }

  agregarCandy(producto: any) {
    this.candy.update(actuales => {
      const existe = actuales.find(c => c.id === producto.id);
      if (existe) {
        existe.cantidad++;
        return [...actuales];
      }
      return [...actuales, { ...producto, cantidad: 1 }];
    });
  }

  quitarCandy(idProducto: number) {
    this.candy.update(actuales => {
      const index = actuales.findIndex(c => c.id === idProducto);
      if (index !== -1) {
        if (actuales[index].cantidad > 1) {
          actuales[index].cantidad--;
        } else {
          actuales.splice(index, 1);
        }
      }
      return [...actuales];
    });
  }

  vaciarCarrito() {
    this.tickets.set([]);
    this.candy.set([]);
  }

  abrirCarrito() {
    this.isCarritoAbierto.set(true);
  }

  cerrarCarrito() {
    this.isCarritoAbierto.set(false);
  }
}