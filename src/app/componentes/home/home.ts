import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Auth } from '../../servicios/auth';
import { CatalogoPeliculas } from '../catalogo-peliculas/catalogo-peliculas';
import { FormsModule } from '@angular/forms';
import { Carrito } from '../carrito/carrito';
import { CarritoService } from '../../servicios/carrito';

@Component({
  imports: [FormsModule, RouterLink, CatalogoPeliculas, Carrito],
  selector: 'app-home',
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class Home implements OnInit {
  public currentUser = signal<any>(undefined);
  public generoBuscado = signal<string>('');
  public esAdmin = signal<boolean>(false);
  constructor(protected auth:Auth, protected carritoSvc:CarritoService){
    this.auth.getUser().then((data)=>{
      if(data.data.user){
        this.currentUser.set(data);
      }
    })
  }

  cerrarSesion(): void{
    this.currentUser.set(null);
    this.auth.signOut();
  }

  onBuscar(valor: string): void {
    this.generoBuscado.set(valor);
  }

  async ngOnInit() {
    try{

      let usuarioId = await this.auth.getId();
  
      const { data, error } = await this.auth.supabase
        .from('datosRegistrados')
        .select('rol')
        .eq('id', usuarioId)
        .single();
  
      if (data && data.rol === 'admin') {
        this.esAdmin.set(true);
        console.log(this.esAdmin);
      }    
    }
    catch{
      console.log("no esta logueado o algo salio mal...");
    }
  }
}
