import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarritoService } from '../../servicios/carrito';
import { Auth } from '../../servicios/auth';
import { jsPDF } from 'jspdf'; // Generador de PDF
import * as QRCode from 'qrcode'; // Generador de QR

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carrito.html',
  styleUrls: ['./carrito.css']
})
export class Carrito implements OnInit {

  carritoSvc = inject(CarritoService);
  private auth = inject(Auth);
  
  puntosDisponibles = signal<number>(0);
  puntosAUsar = signal<number>(0);
  mostrarModalPuntos = signal<boolean>(false);
  
  // Variables temporales para el modal
  totalOriginal = signal<number>(0);
  totalConDescuento = signal<number>(0);
  noQuiere = signal<boolean>(false);

  ngOnInit(): void {
    this.cargarPuntosUsuario();
  }

  iniciarCheckout() {
    const totalActual = this.carritoSvc.granTotal(); 
    
    this.totalOriginal.set(totalActual);

    // Si tiene puntos, mostramos el modal. Si no, pasamos directo al pago final.
    if (this.puntosDisponibles() > 0) {
      this.puntosAUsar.set(0); // Reiniciamos a 0 por defecto
      this.totalConDescuento.set(totalActual);
      this.mostrarModalPuntos.set(true);
    } else {
      this.finalizarCompra();
    }
  }

  async cargarPuntosUsuario() {
    const userId = await this.auth.getId(); // Obtenemos el ID del usuario logueado
    if (!userId) return;

    const { data, error } = await this.auth.supabase
      .from('datosRegistrados')
      .select('puntos')
      .eq('id', userId) 
      .single();

    if (data && data.puntos) {
      this.puntosDisponibles.set(data.puntos);
    }
  }

  rechazar() {
    this.noQuiere.set(true);
    this.mostrarModalPuntos.set(false);
  }

  async finalizarCompra() {
    const usuarioId = await this.auth.getId().catch(()=> 0) || 0;
    const tickets = this.carritoSvc.tickets();
    const candy = this.carritoSvc.candy()
    const granTotal = this.carritoSvc.granTotal();

    if (tickets.length === 0 && candy.length === 0) return;

    try {
      // 1. Armar el lote de inserción con IDs únicos para cada QR
      const todasLasReservas = [];

      for (const ticket of tickets) {
        for (const asiento of ticket.asientos) {
          todasLasReservas.push({
            id_usuario: usuarioId,
            id_funcion: ticket.funcionId,
            codigo_asiento: asiento,
            codigo_qr: crypto.randomUUID(), // Genera un ID único irrepetible (ej: 550e8400-e29b...)
            qr_usado: false
          });
        }
      }

      // 2. Guardar las entradas en la base de datos
      const { error: errReservas } = await this.auth.supabase
        .from('historial_funciones')
        .insert(todasLasReservas);

      if (errReservas) throw new Error('Error al reservar asientos');

      let qrCandy: string | null = null;
      if (candy.length > 0) {
        qrCandy = crypto.randomUUID(); // Un solo QR para todo el pedido de comida
        
        const { error: errCandy } = await this.auth.supabase
          .from('historial_candybar')
          .insert({
            id_usuario: usuarioId,
            codigo_qr: qrCandy,
            detalles: candy, // Guardamos todo el arreglo de compras directo en formato JSON
            qr_usado: false
          });
        if (errCandy) throw new Error('Error en candy bar');
      }

      if(this.noQuiere()){
        // 3. Sistema de Puntos (Solo si el usuario inició sesión)
        if (usuarioId) {
          // Obtenemos sus puntos actuales
          const { data: usuarioData } = await this.auth.supabase
            .from('datosRegistrados')
            .select('puntos')
            .eq('id', usuarioId)
            .single();
  
          const puntosActuales = usuarioData?.puntos || 0;  
  
          // Sumamos lo gastado
          await this.auth.supabase
            .from('datosRegistrados')
            .update({ puntos: puntosActuales + granTotal })
            .eq('id', usuarioId);
        }
      }else{
        const userId = await this.auth.getId();
        console.log(`Procesando pago por $${this.totalConDescuento()} usando ${this.puntosAUsar()} puntos.`);

        // --- DESCONTAR LOS PUNTOS AL USUARIO ---
        if (this.puntosAUsar() > 0) {
          const puntosRestantes = this.puntosDisponibles() - this.puntosAUsar();
          
          const { error } = await this.auth.supabase
            .from('datosRegistrados')
            .update({ puntos: puntosRestantes })
            .eq('id', userId);

          if (!error) {
            this.puntosDisponibles.set(puntosRestantes); // Actualizamos la vista
          }
        }else{
          const puntosRestantes = this.puntosDisponibles() 
          
          const { error } = await this.auth.supabase
            .from('datosRegistrados')
            .update({ puntos: puntosRestantes + granTotal })
            .eq('id', userId);

          if (!error) {
            this.puntosDisponibles.set(puntosRestantes); // Actualizamos la vista
          }
        }
      }

      // 4. Generar y descargar el PDF
      await this.generarReciboPDF(tickets, todasLasReservas, candy, qrCandy);

      alert('¡Compra exitosa! Se sumaron puntos a tu cuenta y tu PDF se está descargando.');
      this.carritoSvc.vaciarCarrito();
      this.mostrarModalPuntos.set(false);
      this.noQuiere.set(false);
      this.cargarPuntosUsuario();
    } catch (error) {
      alert('Hubo un problema procesando tu compra.');
    }
  }

  // async procesarPagoFinal() {
  //   const userId = await this.auth.getId();
    
  //   // --- AQUÍ VA TU LÓGICA ORIGINAL DE COMPRA ---
  //   // (Insertar en historial_funciones, historial_candybar, etc.)
  //   console.log(`Procesando pago por $${this.totalConDescuento()} usando ${this.puntosAUsar()} puntos.`);

  //   // --- DESCONTAR LOS PUNTOS AL USUARIO ---
  //   if (this.puntosAUsar() > 0) {
  //     const puntosRestantes = this.puntosDisponibles() - this.puntosAUsar();
      
  //     const { error } = await this.auth.supabase
  //       .from('datosRegistrados')
  //       .update({ puntos: puntosRestantes })
  //       .eq('id', userId);

  //     if (!error) {
  //       this.puntosDisponibles.set(puntosRestantes); // Actualizamos la vista
  //     }
  //   }

  //   alert('¡Compra realizada con éxito!');
    
  //   // this.vaciarCarrito(); // Limpiar el carrito después de comprar
  // }

  actualizarDescuento(event: Event) {
    const input = event.target as HTMLInputElement;
    let cantidadPuntos = Number(input.value);

    // Evitamos números negativos
    if (cantidadPuntos < 0) cantidadPuntos = 0;

    // No puede usar más puntos de los que tiene
    if (cantidadPuntos > this.puntosDisponibles()) {
      cantidadPuntos = this.puntosDisponibles();
    }

    // No puede usar más puntos que el valor total de la compra (evitar total negativo)
    if (cantidadPuntos > this.totalOriginal()) {
      cantidadPuntos = this.totalOriginal();
    }

    this.puntosAUsar.set(cantidadPuntos);
    this.totalConDescuento.set(this.totalOriginal() - cantidadPuntos);
  }
  // --- GENERADOR DE PDF ---
  async generarReciboPDF(tickets: any[], reservas: any[], candy: any[], qrCandy: string | null) {
    console.log("Esto es el generarPDF y estos son los tickets: ");
    console.log(tickets);
    console.log(reservas);
    console.log(candy);
    console.log(qrCandy);
    const doc = new jsPDF();
    let posicionY = 20;

    doc.setFontSize(22);
    doc.setTextColor(56, 189, 248); 
    if(tickets.length > 0){
      doc.text('Entradas de Cine - Tu Recibo', 20, posicionY);
    }
    posicionY += 20;

    for (const reserva of reservas) {
      // Cruzamos los datos de la reserva con la info visual del ticket
      const ticketInfo = tickets.find(t => t.funcionId === reserva.id_funcion);

      const urlValidacion = `https://cineutn-25c1a.web.app/admin/validar-qr/${reserva.codigo_qr}`;
      
      // Dibujar Textos
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text(`Película: ${ticketInfo.peliculaTitulo}`, 20, posicionY);
      
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Fecha: ${new Date(ticketInfo.fecha).toLocaleDateString()}`, 20, posicionY + 8);
      doc.text(`Horario: ${new Date(ticketInfo.fecha).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} hs`, 20, posicionY + 14);
      
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text(`Sala: ${ticketInfo.sala_id}`, 20, posicionY + 24);
    
      doc.text(`Asiento: ${reserva.codigo_asiento}`, 20, posicionY + 29);

      doc.text(`Precio unitario: $${ticketInfo.precioUnitario}`, 20, posicionY + 36);

      doc.text(`Codigo: ${reserva.codigo_qr}`, 20, posicionY + 45);


      // Transformamos la URL en una imagen Base64 para inyectarla en el PDF
      const qrBase64 = await QRCode.toDataURL(urlValidacion, { margin: 1, width: 80 });
      // Dibujar Imagen del QR (imagen, formato, X, Y, ancho, alto)
      doc.addImage(qrBase64, 'PNG', 130, posicionY - 5, 45, 45);

      // Línea separadora
      doc.setDrawColor(200, 200, 200);
      doc.line(20, posicionY + 50, 190, posicionY + 50);

      posicionY += 55;

      // Si nos quedamos sin hoja, agregamos una nueva
      if (posicionY > 250) {
        doc.addPage();
        posicionY = 20;
      }
    }

    if (candy.length > 0 && qrCandy) {
      // Si ya hay cosas dibujadas, agregamos una hoja nueva para la comida
      if (tickets.length > 0) doc.addPage();
      
      posicionY = 20;
      doc.setFontSize(22);
      doc.setTextColor(234, 179, 8); // Color amarillo/dorado para distinguir el Candy Bar
      doc.text('Ticket Candy Bar', 20, posicionY);
      
      posicionY += 20;
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
    
      // Listamos los productos que compró
      for (const item of candy) {
        doc.text(`${item.cantidad}x ${item.nombre}`, 20, posicionY);

        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);

        doc.text(`Precio Unitario: $${item.precio}`, 20, posicionY + 5);

        posicionY += 10;
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
      }

      // Dibujamos el código QR para el Candy Bar
      const urlCandy = `https://cineutn-25c1a.web.app/admin/validar-qr/${qrCandy}`;
      const base64CandyQR = await QRCode.toDataURL(urlCandy, { margin: 1, width: 80 });
      
      doc.addImage(base64CandyQR, 'PNG', 120, 20, 60, 60);
      
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text('Presenta este código en el mostrador del Candy Bar.', 20, posicionY + 10);
      doc.text(`Codigo Candy Bar: ${qrCandy}`, 20, posicionY + 20);
    }

    doc.save('Mis_Entradas_Cine.pdf');
  }
}