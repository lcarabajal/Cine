import { Routes } from '@angular/router';
import { Home } from './componentes/home/home';

export const routes: Routes = [
    {
        path:'',
        pathMatch:'full',
        redirectTo: 'home'     
    },
    {
        path: 'home',
        component: Home
    },
    {
        path:'login',
        loadComponent: () => import('./componentes/login/login').then(m => m.Login)
    }
    ,
    {
        path:'register',
        loadComponent: () => import('./componentes/register/register').then(m => m.Register)
    }
    ,
    {
        path:'miPerfil',
        loadComponent: () => import('./componentes/mi-perfil/mi-perfil').then(m => m.MiPerfil)
    }
    ,
    {
        path:'adminFunciones',
        loadComponent: () => import('./componentes/admin-funciones/admin-funciones').then(m => m.AdminFunciones)
    }
    ,
    {
        path:'adminPeliculas',
        loadComponent: () => import('./componentes/admin-peliculas/admin-peliculas').then(m => m.AdminPeliculas)
    }
    ,
    {
        path:'historialFunciones',
        loadComponent: () => import('./componentes/historial-funciones/historial-funciones').then(m => m.HistorialFunciones)
    }
    ,
    {
        path:'**',
        loadComponent: () => import('./componentes/error/error').then(m => m.Error)
    }
];
