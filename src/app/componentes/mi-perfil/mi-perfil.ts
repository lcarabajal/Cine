import { Component, OnInit, signal } from '@angular/core';
import { Auth } from '../../servicios/auth';
import { Usuario } from '../../interfaces/usuario';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-mi-perfil',
  styleUrl: './mi-perfil.css',
  templateUrl: './mi-perfil.html',
})
export class MiPerfil  {
  protected usuarioDatos= signal<Usuario | undefined>(undefined);
  public currentUser= signal<any>(undefined);

  constructor(protected auth:Auth){
    this.auth.getUser().then((data)=>{
      if(data.data.user){
        this.currentUser.set(data.data.user);
        this.auth.selectData('datosRegistrados','email',this.currentUser().email).then(query => {

          if(query){
            const detalles = query.data
            this.usuarioDatos.set({nombre:detalles.nombre, apellido:detalles.apellido, puntos:detalles.puntos})
          }
        });
      }
    });
  }
}
