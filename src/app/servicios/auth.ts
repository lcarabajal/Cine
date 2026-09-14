import { Service } from '@angular/core';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { environment } from '../enviroments/enviroment';

@Service()
export class Auth {
    private supabase: SupabaseClient;

    constructor(){
        this.supabase = createClient(environment.supabaseUrl, environment.supabasePublishableKey);
    }

    signIn(email:string, password:string){
        return this.supabase.auth.signInWithPassword({email, password});
    }

    signUp(email:string, password:string){
        return this.supabase.auth.signUp({email, password});
    }

    insertData(data:any, tabla: string){
        return this.supabase.from(tabla).insert(data);
    }

    signOut(){
        return this.supabase.auth.signOut();
    }

    getUser(){
        return this.supabase.auth.getUser();
    }

    getUsers(){
        return this.supabase.auth.admin.listUsers();
    }
}
