import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Auth } from '../../servicios/auth';
import { CommonModule } from '@angular/common';
import { CustomDatepicker } from '../custom-datepicker/custom-datepicker';

@Component({
  imports: [CommonModule,ReactiveFormsModule,RouterModule,CustomDatepicker],
  selector: 'app-register',
  styleUrl: './register.css',
  templateUrl: './register.html',
})
export class Register {
  private fb = inject(FormBuilder);
  private auth = inject(Auth);
  private router = inject(Router);

  mostrarClave: boolean = false;
  sinCoincidencia: boolean = false; 

  mostrarPicker = signal(false);
  fechaElegida = signal<Date | null>(null);

  tiposDeSangre: string[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  coloresDeOjo: string[] = ['Marrón', 'Azul', 'Verde', 'Miel / Ámbar', 'Gris', 'Negro', 'Otro'];

  registerForm: FormGroup = this.fb.group({
    nombre: ['',[Validators.required, Validators.minLength(2)]],
    apellido: ['',[Validators.required, Validators.minLength(2)]],
    email: ['',[Validators.required, Validators.email]],
    clave: ['',[Validators.required, Validators.minLength(6)]],
    claveAConfirmar: ['',[Validators.required, Validators.minLength(6)]],
    fechaDeNacimiento:['',[Validators.required]],
    tipoDeSangre:['',[Validators.required]],
    colorDeOjos:['',[Validators.required]],
    diasDeVacaciones:[0,[Validators.required]]
  });

  esCampoInvalido(nombreCampo:string): boolean {
    //Doble signo de exclamacion significa que solo trabaja con false o true  
    const campo = this.registerForm.get(nombreCampo);
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

    // 3. Inyectamos los datos desarmados en los controles exactos de tu formulario
    this.registerForm.patchValue({
      fechaDeNacimiento: fechaSQL,
    });
    
    // 4. Le avisamos al formulario que estos campos ya fueron completados
    this.registerForm.get('fechaDeNacimiento')?.markAsDirty();
  }

  cambiarVisibilidadClave(): void {
    this.mostrarClave = !this.mostrarClave;
  }

  async guardar(){
    if(this.registerForm.invalid || this.registerForm.get('clave')!.value !== this.registerForm.get('claveAConfirmar')!.value ){
      this.registerForm.markAllAsTouched();
      return
    }

    const {email, clave, nombre, apellido, fechaDeNacimiento, tipoDeSangre, colorDeOjos, diasDeVacaciones} = this.registerForm.value;
    
    const valoresARegistrar = [{
      nombre: nombre,
      apellido: apellido,
      email: email,
      fechaDeNacimiento: fechaDeNacimiento,
      tipoDeSangre: tipoDeSangre,
      colorDeOjos: colorDeOjos,
      diasDeVacaciones: diasDeVacaciones
    }]

    const result = await this.auth.signUp(email, clave);

    if(result){
      const otroResult = await this.auth.insertData(valoresARegistrar,'datosRegistrados');
      if(otroResult){
        console.log(otroResult);
        this.router.navigate(['home'])
      }
    }
    
  }
}


