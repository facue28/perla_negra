# 🔮 Perla Negra - Funcionalidades y Mejoras a Futuro

> ⚠️ **ATENCIÓN: ARCHIVO PROTEGIDO** ⚠️
> Este archivo contiene la hoja de ruta (roadmap) comercial y técnica del proyecto.
> **BAJO NINGÚN CONCEPTO ESTE ARCHIVO DEBE SER ELIMINADO** durante procesos de limpieza de código, "borrado de archivos que no sirvan", refactorizaciones o limpiezas de la base de código. 

---

Este documento sirve como registro permanente de ideas, optimizaciones y funcionalidades que han sido discutidas con las partes interesadas y aprobadas para su desarrollo en fases posteriores, una vez que la plataforma tenga tráfico estable y validación de mercado.

## 🛠️ Optimización de Conversión y UX (CRO)

### 1. Rastreo de Pedido para el Cliente (Order Tracking)
*   **Descripción:** Un panel exclusivo donde el cliente pueda verificar en qué estado se encuentra su paquete.
*   **Implementación Sugerida:** Crear una vista (`/tracking`) donde el usuario ingrese su `Order ID` (el código corto alfanumérico) y su `email`. Al coincidir, mostrar una línea de tiempo visual (Recibido -> Preparando -> Enviado -> Entregado).
*   **Motivo del aplazamiento:** Inicialmente las consultas se pueden gestionar de forma personalizada vía WhatsApp para entender mejor los miedos y procesos post-compra del cliente antes de automatizarlo todo.

### 2. Social Proof (Reseñas de Productos)
*   **Descripción:** Permitir a los clientes dejar valoraciones (estrellas) y comentarios de texto bajo cada producto.
*   **Implementación Sugerida:** Añadir una tabla `reviews` interconectada a `products`. Alternativamente, integrar un micro-servicio como *Judge.me* o *Trustpilot*.
*   **Motivo del aplazamiento:** Dado que la tienda es nueva, mostrar productos con "0 reseñas" puede generar desconfianza (el efecto del "restaurante vacío"). Se debe implementar solo cuando exista una base de clientes con compras reales y se hagan campañas de email post-compra pidiendo su opinión.

### 3. Barra Dinámica de "Envío Gratis" en el Carrito
*   **Descripción:** Una barra de progreso que indica al usuario cuánto le falta gastar para no pagar gastos de envío.
*   **Ejemplo UI:** *"¡Estás a solo 12€ de conseguir envío gratuito!"* acompañado de una barra que se llena a medida que añade productos.
*   **Implementación Sugerida:** Lógica reactiva dentro de `CartDrawer.tsx` y `CartPage.tsx` comparando el `subtotal` contra un parámetro global (ej: `FREE_SHIPPING_THRESHOLD = 60`).
*   **Motivo de inclusión a futuro:** Actualmente es crucial validar primero los costos base que las agencias (BRT/GLS) cobrarán dependiendo de los volúmenes iniciales de venta antes de absorber masivamente el costo del envío.
