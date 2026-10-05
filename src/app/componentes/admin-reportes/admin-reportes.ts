import { Component, inject, signal } from '@angular/core';
import { Auth } from '../../servicios/auth';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  imports: [],
  selector: 'app-admin-reportes',
  styleUrl: './admin-reportes.css',
  templateUrl: './admin-reportes.html',
})
export class AdminReportes {
  private auth = inject(Auth);

  // Señales para la vista
  entradasHoy = signal(0);
  facturacionHoy = signal(0);
  rankingCandy = signal<any[]>([]);
  peliculasMasVistas = signal<any[]>([]);

  ngOnInit() {
    this.cargarReporteDiario();
    this.cargarRankingCandyBar();
    this.cargarGraficoPeliculas();
  }

 // 1. Facturación diaria y recuento de entradas adaptado a tu esquema
  async cargarReporteDiario() {
    const hoy = new Date().toISOString().split('T')[0]; 

    // Traemos los tickets de hoy y cruzamos con 'funciones' para obtener el 'precio'
    const { data, error } = await this.auth.supabase
      .from('historial_funciones')
      .select(`
        id,
        funciones (
          precio
        )
      `)
      .gte('created_at', `${hoy}T00:00:00`)
      .lte('created_at', `${hoy}T23:59:59`);

    if (data) {
      // Como 1 fila en historial = 1 asiento, la cantidad de entradas es simplemente el largo del array
      this.entradasHoy.set(data.length);

      // Sumamos el precio de cada función vinculada a ese ticket
      const facturacion = data.reduce((acc, row: any) => {
        // Aseguramos que sea número
        const precio = Number(row.funciones?.precio || 0); 
        return acc + precio;
      }, 0);
      
      this.facturacionHoy.set(facturacion);
    } else if (error) {
      console.error('Error cargando reporte diario:', error);
    }
  }

  // 2. Películas más vistas agrupadas (Preparando datos para Chart.js)
  async cargarGraficoPeliculas() {
    // Hacemos un Join de 3 niveles: historial -> funciones -> peliculas
    const { data, error } = await this.auth.supabase
      .from('historial_funciones')
      .select(`
        created_at,
        funciones (
          peliculas (
            titulo
          )
        )
      `);

    if (data) {
      // Diccionario para contar cuántos tickets tiene cada película
      const conteoPeliculas: { [titulo: string]: number } = {};

      data.forEach((fila: any) => {
        // Navegamos por la relación que nos devuelve Supabase
        const titulo = fila.funciones?.peliculas?.titulo; 
        
        if (titulo) {
          conteoPeliculas[titulo] = (conteoPeliculas[titulo] || 0) + 1;
        }
      });

      // Convertimos el diccionario a un array ordenado para enviarlo al Gráfico
      const rankingPeliculas = Object.keys(conteoPeliculas)
        .map(titulo => ({ 
          titulo: titulo, 
          entradasVendidas: conteoPeliculas[titulo] 
        }))
        .sort((a, b) => b.entradasVendidas - a.entradasVendidas);

      // Guardamos el resultado en la Signal
      this.peliculasMasVistas.set(rankingPeliculas);
      
      // NOTA: Aquí pasarías 'rankingPeliculas' a tu configuración de Chart.js
    } else if (error) {
      console.error('Error cargando películas más vistas:', error);
    }
  }

  // 2. Ranking e identificación del producto más vendido[cite: 5]
  async cargarRankingCandyBar() {
    const { data, error } = await this.auth.supabase
      .from('historial_candybar')
      .select('detalles'); // Tu columna JSON

    if (data) {
      // Diccionario para contar los productos
      const conteoProductos: { [nombre: string]: number } = {};

      data.forEach(fila => {
        // Asumiendo que "detalle" es un array de objetos comprados
        // Si Supabase te lo devuelve como string, usa JSON.parse(fila.detalle)
        const productosComprados = fila.detalles; 

        productosComprados.forEach((prod: any) => {
          if (conteoProductos[prod.nombre]) {
            conteoProductos[prod.nombre] += prod.cantidad; // O +1 si no tienes cantidad
          } else {
            conteoProductos[prod.nombre] = prod.cantidad || 1;
          }
        });
      });

      // Convertimos el diccionario a un array ordenado de mayor a menor
      const ranking = Object.keys(conteoProductos)
        .map(nombre => ({ nombre, cantidad: conteoProductos[nombre] }))
        .sort((a, b) => b.cantidad - a.cantidad);

      this.rankingCandy.set(ranking.slice(0, 5)); // Guardamos el Top 5
    }
  }

  exportarExcel() {
    // Armamos los datos que queremos exportar
    const datos = this.rankingCandy().map((item, index) => ({
      Posicion: index + 1,
      Producto: item.nombre,
      UnidadesVendidas: item.cantidad
    }));

    // Creamos la hoja de cálculo
    const hoja = XLSX.utils.json_to_sheet(datos);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, 'Ranking CandyBar');
    
    // Descarga el archivo
    XLSX.writeFile(libro, 'Reporte_CandyBar.xlsx');
  }

  // Exportar a PDF[cite: 5]
  exportarPDF() {
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(18);
    doc.text('Reporte de Ventas - Cine', 14, 20);
    
    // Subtítulos con datos
    doc.setFontSize(12);
    doc.text(`Entradas vendidas hoy: ${this.entradasHoy()}`, 14, 30);
    doc.text(`Facturación del día: $${this.facturacionHoy()}`, 14, 38);

    // Tabla de Ranking (usa jspdf-autotable)
    autoTable(doc, {
      startY: 50,
      head: [['Posición', 'Producto', 'Unidades Vendidas']],
      body: this.rankingCandy().map((item, i) => [i + 1, item.nombre, item.cantidad]),
    });

    // Descarga el archivo
    doc.save('Reporte_Ventas.pdf');
  }
}
