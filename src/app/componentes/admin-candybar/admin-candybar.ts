import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../servicios/auth';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-candybar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule,RouterLink],
  templateUrl: './admin-candybar.html',
  styleUrls: ['./admin-candybar.css']
})
export class AdminCandybar implements OnInit {
  private auth = inject(Auth);
  private fb = inject(FormBuilder);

  // Listas de la base de datos
  productos = signal<any[]>([]);
  combos = signal<any[]>([]);

  // Formularios Reactivos
  productoForm!: FormGroup;
  comboForm!: FormGroup;

  // Variables para la selección de productos en el combo
  productosSeleccionados = signal<any[]>([]);

  ngOnInit() {
    this.cargarCandybar();
    this.inicializarFormularios();
  }

  inicializarFormularios() {
    // 1. Formulario para Productos Individuales
    this.productoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: [''],
      precio: [null, [Validators.required, Validators.min(1)]],
      categoria: ['Snacks', Validators.required],
      stock: [0, Validators.min(0)],
      imagen_url: [''],
      activo: [true]
    });

    // 2. Formulario para Combos
    this.comboForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      precio: [null, [Validators.required, Validators.min(1)]],
      imagen_url:['']
    });
  }

  async cargarCandybar() {
    const { data, error } = await this.auth.supabase
      .from('productos_candybar')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.error('Error al cargar candybar:', error);
      return;
    }

    this.productos.set(data.filter(item => !item.es_combo));
    this.combos.set(data.filter(item => item.es_combo));
  }

  // --- FUNCIONES DE ACTUALIZACIÓN RÁPIDA ---
  async actualizarPrecio(item: any) {
    const { error } = await this.auth.supabase
      .from('productos_candybar')
      .update({ precio: item.precio , stock:item.stock})
      .eq('id', item.id);

    if (error) {
      alert('Error al actualizar el precio.');
    } else {
      alert(`Precio o Stock actualizado con exito!`);

      this.auth.registrarAuditoria(
        'Modificación de precio o stock para el candyBar', 
        `Cambió el precio o stock de "${item.nombre}"`
      );
    }
  }

  // --- FUNCIONES PARA CREAR PRODUCTOS INDIVIDUALES ---
  async crearProducto() {
    if (this.productoForm.invalid) {
      this.productoForm.markAllAsTouched();
      alert('Completa los campos obligatorios del producto.');
      return;
    }

    const datos = this.productoForm.value;

    const { error } = await this.auth.supabase
      .from('productos_candybar')
      .insert({
        nombre: datos.nombre,
        descripcion: datos.descripcion,
        precio: datos.precio,
        imagen_url: datos.imagen_url,
        categoria: datos.categoria,
        stock: datos.stock,
        activo: datos.activo,
        es_combo: false
      });

    if (error) {
      alert('Error al registrar el producto.');
    } else {
      alert('¡Producto registrado con éxito!');
      this.productoForm.reset({ categoria: 'Snacks', stock: 0, activo: true });
      this.cargarCandybar();

      this.auth.registrarAuditoria(
        'Creacion de producto candyBar', 
        `Se Creo un nuevo producto`
      );
    }
  }

  // --- FUNCIONES PARA CREAR COMBOS ---
  toggleProductoParaCombo(producto: any, event: any) {
    const seleccionado = event.target.checked;
    if (seleccionado) {
      this.productosSeleccionados.update(lista => [...lista, producto]);
    } else {
      this.productosSeleccionados.update(lista => lista.filter(p => p.id !== producto.id));
    }
  }

  async crearCombo() {
    if (this.comboForm.invalid || this.productosSeleccionados().length === 0) {
      this.comboForm.markAllAsTouched();
      alert('Completa el nombre, precio y selecciona al menos 1 producto para el combo.');
      return;
    }

    const datos = this.comboForm.value;
    const descripcionCombo = this.productosSeleccionados().map(p => p.nombre).join(' + ');

    const { error } = await this.auth.supabase
      .from('productos_candybar')
      .insert({
        nombre: datos.nombre,
        precio: datos.precio,
        es_combo: true,
        categoria: "Combo",
        descripcion: descripcionCombo,
        activo: true,
        imagen_url: datos.imagen_url
      });

    if (error) {
      alert('Error al crear el combo.');
    } else {
      alert('¡Combo creado con éxito!');
      this.comboForm.reset();

      this.auth.registrarAuditoria(
        'Creacion de combo para el candyBar', 
        `Se Creo un combo para el candyBar`
      );
      // Desmarcar visualmente los checkboxes del HTML
      const checkboxes = document.querySelectorAll('.caja-seleccion input[type="checkbox"]') as NodeListOf<HTMLInputElement>;
      checkboxes.forEach(cb => cb.checked = false);
      
      this.productosSeleccionados.set([]);
      this.cargarCandybar();
    }
  }
}