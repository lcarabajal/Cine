import { Routes } from '@angular/router';
import { Home } from './componentes/home/home';
import { Register } from './componentes/register/register';

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
        component:Register
    }
    ,
    {
        path:'**',
        loadComponent: () => import('./componentes/error/error').then(m => m.Error)
    }
];
