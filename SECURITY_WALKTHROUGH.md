# MANUAL DE SEGURIDAD Y PRE-FLIGHT CHECKLIST: PERLA NEGRA

**Fecha de Última Actualización:** 2026-02-13
**Objetivo:** Guía unificada para mantener la seguridad del proyecto a lo largo del tiempo, especialmente al introducir usuarios NO-ADMIN (clientes).

---

# PARTE 1: SECURITY WALKTHROUGH (PROTOCOLO FUTURO)

Utilizar esta guía **CADA VEZ** que se vaya a habilitar el registro de usuarios o crear un nuevo rol de cliente.

## 1. Objetivo y Alcance
*   **Amenazas a mitigar:**
    *   **Escalación Vertical:** Que un cliente se convierta en Admin.
    *   **IDOR (Horizontal):** Que un cliente vea datos privados de otro cliente (órdenes, direcciones).
    *   **Abuso de Storage:** Que un usuario suba archivos basura o borre imágenes del sitio.
*   **Componentes bajo prueba:** Frontend (React), Supabase Auth, Base de Datos (RLS), Funciones (RPC) y Almacenamiento (Storage).

## 2. Preparación (Antes de Testear)
1.  **Crear Usuario de Prueba (No-Admin):**
    *   Registrar un usuario nuevo con un email que **NO** contenga la palabra "admin".
    *   **Verificación Crítica:** Ir a la tabla `admins` en Supabase y confirmar que este email **NO EXISTE**.
    *   Confirmar que la función `is_admin` devuelve `false` para este usuario.
2.  **Entorno de Prueba:**
    *   Usar Navegador en **Modo Incógnito**.
    *   Abrir **DevTools** (F12) > Pestaña **Network** y **Console**.
    *   Asegurar que "Disable Cache" esté desmarcado (para simular usuario real).

## 3. Matriz de Permisos Esperada ("La Verdad")
Esta tabla define el comportamiento correcto. Cualquier desviación es un fallo de seguridad.

| Recurso | Acción | Anónimo | Cliente (No-Admin) | Admin |
| :--- | :--- | :--- | :--- | :--- |
| **Productos** | Leer | ✅ Permitido | ✅ Permitido | ✅ Permitido |
| **Productos** | Crear/Editar/Borrar | ⛔ Denegado | ⛔ Denegado | ✅ Permitido |
| **Órdenes** | Leer | ⛔ Denegado | ⚠️ Solo Propias (si aplica) | ✅ Todas |
| **Órdenes** | Crear | ✅ Permitido (RPC) | ✅ Permitido (RPC) | ✅ Permitido |
| **Admins** | Leer | ⛔ Denegado | ⛔ Denegado | ✅ Permitido |
| **Storage (Fotos)** | Leer | ✅ Permitido | ✅ Permitido | ✅ Permitido |
| **Storage (Fotos)** | Subir/Borrar | ⛔ Denegado | ⛔ Denegado | ✅ Permitido |

---

## 4. Pruebas de UI (Acceso Frontend)
**Acción:** Intentar ingresar manualmente a la URL `/admin` estando logueado como cliente.

*   **Resultado Esperado:**
    *   Redirección inmediata a la página de inicio (Home) O Pantalla de "Acceso Denegado" (403).
    *   NO se debe mostrar el Dashboard ni parpadear contenido admin.
*   **Evidencia a Guardar:**
    *   Captura de pantalla del mensaje de bloqueo.
    *   Verificar en URL que no se quedó en `/admin`.

## 5. Pruebas de API / RLS (La Prueba Real)
Aquí verificamos que la base de datos bloquee al usuario, incluso si la UI falla.

### A) Productos (Products)
*   **Acción:** Intentar hacer un UPDATE o DELETE a un producto cualquiera desde la consola de Supabase JS.
*   **Network:** Buscar request `PATCH` o `DELETE` a `/rest/v1/products...`
*   **Esperado:** Status **403 Forbidden** o **401 Unauthorized**. Error RLS en respuesta.
*   **Fallo:** Si devuelve 200 OK o 204 No Content.

### B) Órdenes (Orders)
*   **Acción 1:** Intentar hacer un `SELECT * FROM orders`.
*   **Esperado:** Array vacío `[]` (si RLS oculta todo) o error. NUNCA lista de órdenes de otros.
*   **Acción 2 (IDOR):** Si tenés el ID de una orden de *otro* usuario, intentar hacer `SELECT * FROM orders WHERE id = 'ID_AJENO'`.
*   **Esperado:** Array vacío `[]` o Error.

### C) Admins
*   **Acción:** Intentar `SELECT * FROM admins`.
*   **Esperado:** Array vacío `[]`. El usuario no debe poder ver quiénes son los administradores.

### D) Cupones (Coupons)
*   **Acción:** Intentar leer la tabla `coupons` directamente.
*   **Esperado:** Bloqueo o lista vacía (los cupones se validan por RPC, no por lectura directa de tabla, usualmente).

## 6. Pruebas de Storage (Fotos)
**Acción:** Intentar subir un archivo pequeño `.txt` o `.jpg` al bucket `images` usando el cliente Supabase.

*   **Network:** Buscar request `POST` a `/storage/v1/object/images/...`
*   **Esperado:** Status **403 Forbidden** (Acceso Denegado por Policy).
*   **Fallo Crítico:** Status 200 OK (Significa que la policy "authenticated" está muy abierta).

## 7. Pruebas de "Tampering" (Bypass UI)
**Caso Conceptual:** Imaginar que el atacante modifica el código JS localmente para forzar que la variable `isAdmin` sea `true` en el navegador.

*   **Acción:** Aunque logre ver botones de "Editar", al hacer clic:
*   **Esperado:** La base de datos (Backend) debe rechazar la operación (Network Error 403).
*   **Fallo:** Si la operación pasa, significa que la DB confía en el Frontend (Grave).

## 8. Criterios de Aprobación (PASS/FAIL)
**BLOQUEANTES (Si ocurre uno, NO se puede habilitar el registro):**
1.  [ ] No-Admin puede subir o borrar fotos en Storage.
2.  [ ] No-Admin puede modificar Productos.
3.  [ ] No-Admin puede leer Órdenes de otras personas.
4.  [ ] No-Admin puede leer la lista de emails de Admins.

**Remediación:**
*   Si falla Storage: Revisar Policies en `storage.objects`.
*   Si falla DB: Revisar RLS Policies en la tabla correspondiente.
*   Si falla UI: Revisar `ProtectedRoute.tsx`.

## 9. Registro de Resultados
Copiar y llenar esta bitácora cada vez que se ejecuten pruebas.

| Fecha | Entorno | Versión/Commit | Pass/Fail | Link a Evidencias |
| :--- | :--- | :--- | :--- | :--- |
| DD/MM/AAAA | Producción | (Hash) | PASS/FAIL | (Notas/Capturas) |

---
---

# PARTE 2: PRE-FLIGHT CHECKLIST (RÁPIDO)

**Frecuencia:** Ejecutar en 5 minutos CADA VEZ que se toque algo de seguridad o antes de crear un usuario.

### 1. Supabase Auth
- [ ] **Signups:** Confirmar si "Enable Signups" está ON u OFF. (Debe coincidir con lo que querés: OFF si solo sos vos, ON si ya abrís la tienda).
- [ ] **Providers:** Verificar que solo Email (y los necesarios) estén habilitados.

### 2. Keys & Secrets
- [ ] **Frontend:** Buscar "service_role" en el código del repositorio. No debe existir.
- [ ] **Environment:** Confirmar que variables de producción usan la Anon Key correcta.

### 3. RLS Coverage
Verificar en Dashboard > Authentication > Policies:
- [ ] **Orders:** RLS Habilitado (ON). Policies de INSERT/UPDATE restrictivas.
- [ ] **Products:** RLS Habilitado (ON).
- [ ] **Admins:** RLS Habilitado (ON).

### 4. Storage Bucket (Images)
Verificar en Dashboard > Storage > Policies:
- [ ] **Anon:** Solo lectura (SELECT).
- [ ] **Authenticated (No-Admin):** NO debe tener permisos de INSERT/UPDATE/DELETE. (Buscar policy que diga `TO authenticated` sin condiciones extra).
- [ ] **Admin:** Permisos totales de escritura.

### 5. RPC / Functions
- [ ] **create_order:** Confirmar que no permite inyección SQL (usa parámetros) y valida precios en servidor.
- [ ] **is_admin:** Confirmar que es `SECURITY DEFINER` para leer la tabla admins segura.

### 6. Smoke Test (Producción)
- [ ] Abrir `/productos` en navegador.
- [ ] Abrir DevTools > Network.
- [ ] Clic en el request del documento (HTML).
- [ ] Confirmar Header: `cache-control: public, max-age=0, must-revalidate`.

### Resumen Pre-Flight

| Item | Resultado (PASS/FAIL) | Acción si Falla |
| :--- | :--- | :--- |
| Auth Config | | Ajustar en Dashboard |
| Keys Clean | | Rotar keys y limpiar código |
| RLS Active | | Activar RLS en tabla |
| Storage Safe | | Correr script de hardening |
| Headers OK | | Revisar vercel.json |
