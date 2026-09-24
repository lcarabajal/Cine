import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Auth } from '../../servicios/auth';
import { CatalogoPeliculas } from '../catalogo-peliculas/catalogo-peliculas';
import { FormsModule } from '@angular/forms';

@Component({
  imports: [FormsModule, RouterLink, CatalogoPeliculas],
  selector: 'app-home',
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class Home {
  public currentUser = signal<any>(undefined);
  public generoBuscado = signal<string>('');
  
  constructor(protected auth:Auth){
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
}
