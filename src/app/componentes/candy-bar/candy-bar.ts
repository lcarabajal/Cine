import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Auth } from '../../servicios/auth'; 
import { CarritoService } from '../../servicios/carrito'; // <-- Importamos el servicio
import { Carrito } from '../carrito/carrito';
import { RouterLink } from '@angular/router';

export interface ProductoCandy {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  imagen_url: string;
  stock: number;
}

@Component({
  selector: 'app-candy-bar',
  standalone: true,
  imports: [CommonModule,Carrito,RouterLink],
  templateUrl: './candy-bar.html',
  styleUrls: ['./candy-bar.css']
})
export class CandyBar implements OnInit {
  private auth = inject(Auth);
 
  // Lo hacemos 'public' para poder llamarlo desde el HTML
  public carritoSvc = inject(CarritoService); 

  productos = signal<ProductoCandy[]>([]);
  isLoading = signal<boolean>(true);

  async ngOnInit(): Promise<void> {
    await this.cargarProductos();
  }

  async cargarProductos(): Promise<void> {
    this.isLoading.set(true);
    const { data, error } = await this.auth.supabase
      .from('productos_candybar')
      .select('*')
      .eq('activo', true)
      .order('categoria');

    if (!error && data) {
      this.productos.set(data as ProductoCandy[]);
    }
    this.isLoading.set(false);
  }

  irAlCarritoGlobal(): void {
    this.carritoSvc.abrirCarrito();
  }
}