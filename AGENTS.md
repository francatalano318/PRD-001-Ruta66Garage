# AGENTS.md

## Propósito

Ruta 66 Garage es un sistema de órdenes de trabajo para talleres mecánicos que clasifica y prioriza automáticamente cada incidencia mediante IA. Permite registrar, dar seguimiento y corregir manualmente esa clasificación durante el ciclo de vida de la orden.

## Stack

* Backend: Node.js 20 LTS + TypeScript 5.x + NestJS
* Frontend: React 18 + TypeScript 5.x
* Base de datos: PostgreSQL 16
* Clasificación automática: API de OpenAI
* Gestor de paquetes: npm (workspaces) — `/backend` y `/frontend`
* Tests: Jest

## Cómo correr

```bash
# Instalar (raíz, instala backend y frontend vía workspaces)
npm install

# Levantar backend
npm run dev --workspace=backend

# Levantar frontend
npm run dev --workspace=frontend

# Correr tests (todos los workspaces)
npm test --workspaces
```

## Qué NO hacer

* No bloquear la creación de una orden si el servicio de IA falla o no responde: debe crearse igual como "Sin clasificar" y sin prioridad (RF-23).
* No asignar categorías o prioridades fuera de las listas cerradas de RF-06/RF-07 (Motor, Frenos, Suspensión, Dirección, Electricidad, Transmisión, Otro, Sin clasificar / Alta, Media, Baja, Sin asignar).
* No implementar soporte multi-taller o multi-usuario: está fuera de alcance en esta versión (ver "Fuera de Alcance" del PRD).
