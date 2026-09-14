import { Component, inject} from '@angular/core';

import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../servicios/auth';

import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  imports: [ReactiveFormsModule, FormsModule, RouterLink],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {
[x: string]: any;
  private fb = inject(FormBuilder);
  private auth = inject(Auth);
  private router = inject(Router);

  mostrarClave: boolean = false;

  loginForm: FormGroup = this.fb.group({
    email: ['',[Validators.required, Validators.email]],
    clave: ['',[Validators.required, Validators.minLength(6)]],
  });

  cambiarVisibilidadClave(): void {
    this.mostrarClave = !this.mostrarClave;
  }

   esCampoInvalido(nombreCampo:string): boolean {
    //Doble signo de exclamacion significa que solo trabaja con false o true  
    const campo = this.loginForm.get(nombreCampo);
    return !!(campo?.invalid && campo.touched)
  }

  async guardar(){
    if(this.loginForm.invalid){
      this.loginForm.markAllAsTouched()
      return;
    }
   
    const {email, clave} = this.loginForm.value;

    const result = await this.auth.signIn(email, clave);
  
    if(result.error){
      return
    }
  
    this.router.navigate(['home']);
  }
}
