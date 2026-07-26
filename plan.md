# Plan de implementación — Ruta 66 Garage

Plan de trabajo para completar los requerimientos del PRD (`PRD-001-Ruta66Garage-v2.md`) que quedaron fuera del slice inicial ("feature core"). Se sigue con pasos chicos, en orden, con confirmación antes de cada uno.

## Hecho

### Feature core — alta de orden + clasificación por IA
Cubre RF-03, RF-04, RF-05, RF-06, RF-07, RF-08, RF-09, RF-10, RF-11, RF-20, RF-21, RF-22, RF-23, RF-24 y RNF-02/03/04.

1. Modelo de datos (`Orden` + migración + Postgres vía Docker Compose).
2. Endpoint `POST /ordenes` sin IA (validaciones RF-20/RF-21).
3. Integración con OpenAI (clasificación automática, Structured Outputs).
4. Manejo de falla del servicio de IA (RF-22/23/24: la orden se crea igual).
5. Endpoints de ajuste manual `PATCH /ordenes/:id/categoria` y `/prioridad` (RF-08/RF-09).
6. Frontend: formulario de alta con validaciones y aviso de fallo de IA.
7. Frontend: vista de detalle con indicador "asignado por IA" (RF-10/RF-11) y edición manual.

### Bloque A — Autenticación
Cubre RF-01, RF-02.

1. Backend: entidad `Usuario` + migración con usuario sembrado (`admin@ruta66garage.com`).
2. Backend: `POST /auth/login` (JWT) + guard global (`@Public()` para excepciones).
3. Frontend: pantalla de login, manejo del token, sin sesión no se ve nada protegido.

**Decisiones ya tomadas** (por si hace falta recordarlas más adelante):
- No hay endpoint de alta de usuarios — se siembran por migración, según el PRD no lo pide.
- Orden de bloques: A → B → C.

## Pendiente

### Bloque B — Listado, filtros y detalle
Cubre RF-12, RF-13, RF-14, RF-15, RF-16, RNF-05, RNF-08.

1. ✅ **Backend:** `GET /ordenes` paginado (máximo 20 por página, RNF-08) con filtros combinables (AND) por `estado`, `categoria` y `prioridad` (RF-12 a RF-15), protegido por el guard de auth. Respuesta `{ ordenes, total, pagina, totalPaginas }`, orden por `createdAt DESC`. Migración con índices en `estado`/`categoria`/`prioridad`/`created_at` (RNF-05). `GET /ordenes/:id` — detalle completo de una orden (RF-16). 24 tests e2e (`ordenes.e2e.spec.ts`) cubriendo paginación, cada filtro, combinación AND, 401 y 404.
2. ✅ **Frontend:** se agregó `react-router-dom` (v7) y rutas reales: `/ordenes` (listado con filtros y paginación, `ListadoOrdenes.tsx`), `/ordenes/nueva` (el formulario de alta existente) y `/ordenes/:id` (`OrdenDetallePagina.tsx`, detalle de una orden ya existente). `DetalleOrden` ganó un prop `mostrarMensajeCreacion` (default `true`) para no mostrar "creada correctamente" fuera del flujo de alta, y ahora también muestra cliente/patente/descripción/estado (antes solo mostraba categoría/prioridad editables). Nav simple con enlaces "Listado"/"Nueva orden". 16 tests nuevos de componentes + `App.spec.tsx` actualizado a la navegación real.

**Nota:** el detalle (`GET /ordenes/:id`) ya incluye `observaciones` desde el Bloque C.

### Bloque C — Cambio de estado y observaciones ✅
Cubre RF-17, RF-18, RF-19.

7. ✅ **Backend:** `PATCH /ordenes/:id/estado`, restringido a los 4 estados cerrados de RF-17 (Abierta, En diagnóstico, Reparando, Finalizada). RF-18 se resolvió con una columna dedicada `estado_actualizado_en` (timestamptz), separada de `updated_at` (que también se toca al editar categoría/prioridad), pisada solo en este PATCH — sin tabla de historial, ya que ningún AC pide mostrar transiciones pasadas.
8. ✅ **Backend:** `PATCH /ordenes/:id/observaciones` (RF-19). Campo único de texto que se pisa en cada edición (no un historial acumulable — confirmado con el usuario). `GET /ordenes/:id` ahora devuelve `observaciones`.
9. ✅ **Frontend:** en `DetalleOrden` (reutilizado tanto en el resultado de creación como en el detalle de una orden existente): selector de estado con las 4 opciones cerradas + botón "Guardar estado", y textarea de observaciones + botón "Guardar observaciones". 9 tests e2e de backend nuevos (`ordenes.e2e.spec.ts`) y 4 tests de componente nuevos (`DetalleOrden.spec.tsx`).

## Decisiones tomadas durante la implementación

- **RF-18**: timestamp dedicado (`estadoActualizadoEn`), no tabla de historial — decisión confirmada con el usuario antes de implementar.
- **RF-19**: un único campo de observaciones que se sobreescribe en cada edición, no una lista acumulable — confirmado explícitamente por el usuario.
- **Filtros combinables (RF-13/14/15)**: el PRD no aclara si los filtros de estado/categoría/prioridad se pueden combinar entre sí. Se asumió combinables (AND) por ser el comportamiento estándar.

## Estado general

Los tres bloques (A, B, C) están completos. Cobertura del PRD: RF-01 a RF-24 y RNF-01 a RNF-08 implementados. Backend: 46 tests (más el spec de integración real con OpenAI, que depende de cuota de la API). Frontend: 32 tests, `tsc -b` limpio.
