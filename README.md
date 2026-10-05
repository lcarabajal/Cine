# 🎬 CINEUTN

Esta es una aplicación web diseñada para ofrecer una experiencia de usuario fluida, desde la exploración de la cartelera hasta la compra de entradas y snacks, incluyendo un sistema de fidelidad y validación digital.

### 1. 🔐 Autenticación y Registro Seguro
* **Login y Registro Funcional:** Sistema de autenticación completo para usuarios.
* **Datepicker Customizado:** El formulario de registro cuenta con un selector de fechas (Datepicker) totalmente personalizado e integrado con la estética oscura de la aplicación para seleccionar la fecha de nacimiento de manera cómoda.
# DatePickerCustom
<img width="1040" height="958" alt="datepickercustom" src="https://github.com/user-attachments/assets/7d1f8ea3-f3b5-417a-82b8-15be6f3b39c5" />

# Registro
<img width="1906" height="1072" alt="registro" src="https://github.com/user-attachments/assets/5a64576a-0e88-4e20-adc6-cec2b07c7afe" />

# Login
<img width="1903" height="1072" alt="login" src="https://github.com/user-attachments/assets/5f080930-0644-4e44-be17-ad549a443e2b" />

### 2. 🎞️ Home y Catálogo de peliculas
<img width="1903" height="1077" alt="1" src="https://github.com/user-attachments/assets/8954e96b-7d18-4342-bf4a-a675ae2a8816" />

* **Cartelera Dinámica:** Una vista principal que organiza el contenido de forma atractiva.
* **Top 3 Tendencias:** Sección especial que destaca visualmente las 3 películas más vistas o populares.
* **Próximamente:** Carrusel o sección dedicada a los futuros estrenos.
* **Funciones Disponibles:** Cada película muestra sus horarios, sala y detalles técnicos directamente en el catálogo para facilitar la elección.

### 3. 💺 Selección de Asientos Interactiva
<img width="1904" height="1076" alt="2" src="https://github.com/user-attachments/assets/516dbaa7-15fc-44b5-a125-9a4ed0f77f77" />

* **Mapa de Sala en Tiempo Real:** Interfaz gráfica para seleccionar los asientos de la función.
* **Categorización de Asientos:** La sala se divide visualmente en diferentes categorías para una mejor experiencia:
  * **Estándar:** Asientos regulares.
  * **Preferencial / VIP:** Ubicaciones óptimas (ej. centro de la sala).
  * **Discapacitados / Últimas Filas:** Espacios designados para necesidades específicas o preferencias de ubicación.

### 4. 🍿 Módulo de Candy Bar
<img width="1906" height="1073" alt="3" src="https://github.com/user-attachments/assets/0840596b-fe1c-4bf5-89db-206b2289914f" />
* **Catálogo de Snacks:** Los usuarios pueden explorar y agregar bebidas, chocolates, pochoclos y combos especiales a su pedido antes de finalizar la compra.

### 5. 🛒 Carrito de Compras Unificado
<img width="1906" height="1074" alt="4" src="https://github.com/user-attachments/assets/0f8f0e2b-3767-49ab-9c94-0d88df972b5d" />

* Un servicio de carrito persistente que consolida toda la compra en un solo lugar.
* Muestra un desglose claro separando los tickets de cine (con sus respectivos asientos) y los productos seleccionados en el Candy Bar, calculando el subtotal y el total final.

### 6. 🎁 Sistema de Puntos de Fidelidad
<img width="1905" height="1079" alt="5" src="https://github.com/user-attachments/assets/0663df54-89d0-4118-89ed-8903ae3387e0" />

* **Recompensas para Usuarios:** Los usuarios registrados acumulan puntos con sus compras.
* **Descuentos Flexibles:** Al momento de hacer el checkout (pagar el carrito), el sistema detecta si el usuario tiene puntos disponibles y le permite elegir cuántos desea canjear.
* **Compras Gratuitas:** Si el saldo de puntos es suficiente, el usuario puede cubrir el 100% de la compra y llevarse sus entradas y combos completamente gratis.

### 7. 🎟️ Tickets Digitales (PDF y Códigos QR)

<img width="802" height="492" alt="6" src="https://github.com/user-attachments/assets/111b16a6-3a11-40c4-bb95-802bb5c971ad" />
<img width="788" height="407" alt="7" src="https://github.com/user-attachments/assets/e67d29d5-c85c-4722-8ba5-db81b398d59e" />

* **Generación Automática:** Tras confirmar la compra, el sistema genera recibos digitales en formato PDF.
* **Validación QR Independiente:** 
  * Un código QR seguro para la entrada a la sala (validando película, fecha, horario y asiento).
  * Un código QR separado para presentar en el mostrador del Candy Bar y reclamar los dulces adquiridos.


### 8. 📜 Historial de Usuario
<img width="1898" height="1070" alt="8" src="https://github.com/user-attachments/assets/0669a746-109e-4a1a-8071-c0c917f1bb28" />
* **Mis Compras:** Una vista dedicada donde el cliente puede revisar todo su historial de funciones pasadas y futuras, viendo la fecha, el formato, los asientos asignados y el monto pagado.

-----------------------------------------------------------------------

## 🛡️ Panel de Administración (Backoffice)
* **📊 Dashboard de Gestión:** Un panel de control centralizado con acceso rápido a todos los submódulos.
El sistema cuenta con un área restringida exclusiva para los administradores y empleados del cine, diseñada para gestionar toda la operación diaria:
<img width="1901" height="1076" alt="9" src="https://github.com/user-attachments/assets/da10a98d-3567-49fc-b849-05bf8c70833d" />

* **🎬 Gestión de Cartelera:**
  <img width="1902" height="1052" alt="9-1" src="https://github.com/user-attachments/assets/15d7726c-6ad1-4495-9de8-901a00aad756" />
  <img width="1898" height="901" alt="9-2" src="https://github.com/user-attachments/assets/caf4d0ea-a3a8-4eda-bdbb-cd68fa088c21" />

  * **Agregar Películas:** Formulario para registrar nuevos títulos con su sinopsis, duración, clasificación, póster y etiquetas.
  * **Programar Funciones:** Herramienta para asignar horarios, salas (con opción de sala al azar), formatos (2D/3D), idioma y precio por entrada.
  
* **🍬 CRUD de Candy Bar:** Interfaz para el control de inventario. Permite crear nuevos productos individuales, armar combos especiales y actualizar precios o stock de manera instantánea.
  <img width="1914" height="1076" alt="10" src="https://github.com/user-attachments/assets/ff92f1a3-6f48-4a28-a311-9ebff5aa8589" />

* **📲 Validador de Entradas (QR):** Herramienta ágil para acomodadores que permite escanear códigos QR o ingresar el código alfanumérico manualmente. Cuenta con alertas visuales tipo "Overlay" para indicar *Acceso Permitido* o *Acceso Denegado* (evitando tickets duplicados).
<img width="1919" height="1077" alt="12" src="https://github.com/user-attachments/assets/dcdb80c7-d3c2-45c5-9fe6-eb358dcd71d1" />
<img width="1917" height="905" alt="12-1" src="https://github.com/user-attachments/assets/689aa5a7-a88d-4aa7-a85d-5936f6bcdac3" />
<img width="1918" height="904" alt="12-2" src="https://github.com/user-attachments/assets/325defe4-45b8-4d7b-a83a-edaf54ab133a" />

* **📈 Reportes y Estadísticas:** Panel analítico con visualización de facturación diaria y recuento de entradas vendidas. Incluye botones para exportar los reportes contables a formatos **PDF** y **Excel**.
  <img width="1917" height="1079" alt="11" src="https://github.com/user-attachments/assets/44222d6a-3dd4-4e3e-97a9-1075358d77d3" />

* **📝 Registro de Auditoría (Activity Log):** Bitácora de seguridad que rastrea y documenta automáticamente las acciones sensibles (ej. cambio de precios, validación de tickets) indicando la fecha, la hora y el ID del administrador responsable.
  <img width="1917" height="1077" alt="13" src="https://github.com/user-attachments/assets/a9ce0bfc-7558-46d1-b15d-683b5b477caf" />


