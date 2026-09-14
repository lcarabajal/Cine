import { Component, signal, Signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Auth } from '../../servicios/auth';

@Component({
  imports: [RouterLink],
  selector: 'app-home',
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class Home {
  public currentUser = signal<any>(undefined);
  
  constructor(protected auth:Auth){
    this.auth.getUser().then((data)=>{
      console.log(data);
      if(data.data.user){
        this.currentUser.set(data);
        console.log(this.currentUser());
      }
    })
  }

  cerrarSesion(){
    this.currentUser.set(null);
    this.auth.signOut();
  }
}
