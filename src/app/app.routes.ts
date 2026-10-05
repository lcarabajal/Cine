import { Routes } from '@angular/router';
import { Home } from './componentes/home/home';
import { ValidarQr } from './componentes/validar-qr/validar-qr';
import { adminGuard } from './guards/admin-guard';


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
        path: 'admin',
        loadComponent: () => import('./componentes/admin-dashboard/admin-dashboard').then(m => m.AdminDashboard),
        canActivate: [adminGuard]
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
        path:'adminCandyBar',
        loadComponent: () => import('./componentes/admin-candybar/admin-candybar').then(m => m.AdminCandybar),
        canActivate:[adminGuard]
    }
    ,
    {
        path:'adminFunciones',
        loadComponent: () => import('./componentes/admin-funciones/admin-funciones').then(m => m.AdminFunciones),
        canActivate:[adminGuard]
    }
    ,
    {
        path:'adminPeliculas',
        loadComponent: () => import('./componentes/admin-peliculas/admin-peliculas').then(m => m.AdminPeliculas),
        canActivate:[adminGuard]
    }
    ,
    {
        path:'historialFunciones',
        loadComponent: () => import('./componentes/historial-funciones/historial-funciones').then(m => m.HistorialFunciones)
    }
    ,
    {
        path:'candyBar',
        loadComponent: () => import('./componentes/candy-bar/candy-bar').then(m => m.CandyBar)
    }
    ,
    {
        path:'carrito',
        loadComponent: () => import('./componentes/carrito/carrito').then(m => m.Carrito)
    }
    ,
    {
        path: 'admin/validar-qr/:codigo',
        component: ValidarQr
    }
    ,
    {
        path: 'admin/validar-qr',
        component: ValidarQr,
        canActivate: [adminGuard]
    },
    {
        path: 'adminReportes',
        loadComponent: () => import('./componentes/admin-reportes/admin-reportes').then(m => m.AdminReportes),
        canActivate: [adminGuard]
    },
    {
        path: 'adminHistorial',
        loadComponent: () => import('./componentes/admin-activitylog/admin-activitylog').then(m => m.AdminActivitylog),
        canActivate: [adminGuard]
    },
    {
        path:'**',
        loadComponent: () => import('./componentes/error/error').then(m => m.Error)
    }
];
