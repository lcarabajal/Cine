import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../servicios/auth'; 

export const adminGuard: CanActivateFn = async (route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);

  try {
    // Esto es nativamente asíncrono, por lo que pausará el Guard los milisegundos 
    // necesarios hasta que el navegador termine de cargar al usuario.
    const { data: { session }, error: sessionError } = await auth.supabase.auth.getSession();

    // Si no hay sesión en el navegador, lo mandamos al login
    if (sessionError || !session) {
      router.navigate(['/login']);
      return false;
    }

    // 2. Como ya le dimos tiempo al sistema, ahora sí tu método encontrará el ID
    let usuarioId = await auth.getId();

    if (!usuarioId) {
      router.navigate(['/login']);
      return false;
    }

    // 3. Buscamos el rol en la base de datos
    const { data, error } = await auth.supabase
      .from('datosRegistrados')
      .select('rol')
      .eq('id', usuarioId)
      .single();

    // 4. Comprobamos si es admin
    if (data && data.rol === 'admin') {
      return true; // Acceso permitido
    } else {
      alert('Acceso Denegado: Esta área es solo para personal del cine.');
      router.navigate(['/']); 
      return false;
    }

  } catch (err) {
    console.error('Error en el Guard de Admin:', err);
    router.navigate(['/']);
    return false;
  }
};