# GYMAKER

GYMAKER es una aplicación web (SPA) de seguimiento de entrenamientos centrada en rendimiento y privacidad: todos tus datos viven en tu navegador (localStorage). Permite registrar sesiones por fecha, reutilizar rutinas, mantener una biblioteca de ejercicios con memoria inteligente y calcular PRs automáticamente (e1RM).

## Características principales

- 100% local: entrenos, rutinas, biblioteca, preferencias y backups se guardan en tu navegador.
- Navegación por pestañas: Workout · Calendar · My Data · Settings.
- Autocompletado inteligente de ejercicios: sugiere desde la biblioteca y muestra el último “historial” (peso×reps).
- Sets rápidos: al añadir un set se copian automáticamente el peso y reps del set anterior.
- PR Engine: estima 1RM (Brzycki) y marca sets que baten tu mejor histórico.
- Calendario mensual: días con entreno, acceso directo para “Log workout” y copia selectiva de ejercicios.
- Estadísticas: Quick Stats + panel de PRs filtrable por nombre/tag y ordenable por fuerza estimada (e1RM).
- Gestión de datos: export CSV por rango de fechas + Backup/Restore mediante código.

## Cómo se usa (día a día)

### 1) Workout (registro de sesión)

1. Abre la pestaña “Workout”.
2. Cambia de día con las flechas o tocando la cabecera de fecha (abre un mini-calendario).
3. (Opcional) Escribe un título de sesión en “Session title”.
4. Pulsa “Add exercise”.
5. En la tarjeta del ejercicio:
   - Escribe el nombre del ejercicio y elige una sugerencia del autocompletado para reutilizarlo.
   - Despliega “Tags” para ver/añadir/quitar etiquetas.
   - Añade notas en “Notes…”.
   - Añade sets con “Add Set” (se centra el último set automáticamente en horizontal).

#### Autocompletado y memoria

- Las sugerencias salen de la biblioteca interna (Exercise Library).
- Cuando seleccionas un ejercicio existente, el autocompletado muestra el último “Last: 40×10 · 40×10 …” para ayudarte a recordar tu última sesión.

#### Sets, pesos y PRs

- Al crear un set nuevo dentro del mismo ejercicio, se heredan el peso y reps del set anterior.
- Se calcula e1RM (estimación de 1RM) con Brzycki:

  \[
  e1RM = \frac{Weight}{1.0278 - (0.0278 \times Reps)}
  \]

- Un set se marca como PR si su e1RM supera el mejor histórico del ejercicio.

### 2) Calendar (historial por días)

- Vista mensual con navegación por meses.
- Toca un día:
  - Si no hay entreno, verás “Log workout” para saltar a “Workout” en esa fecha.
  - Si hay entreno, se abre un modal para copiar ejercicios de ese día de forma selectiva.

#### Copiar ejercicios (selectivo)

1. Abre un día con entreno en “Calendar”.
2. En el modal, selecciona qué ejercicios quieres copiar.
3. Elige el día de destino (desde el propio modal) y pega solo los ejercicios marcados.

### 3) My Data (PRs y estadísticas)

- “Quick Stats”: resumen de volumen, sets, entrenos, PRs y última fecha con sesión.
- Filtros:
  - Search by name
  - Search by tag
- Orden:
  - Weight: High → Low / Low → High (ordenado por e1RM estimado).

### 4) Settings (preferencias, biblioteca, rutinas y datos)

#### Preferencias

- Weight Increment: 0.5 / 1 / 2.5 (afecta a los controles de ajuste de peso).
- Week Starts On: Monday / Sunday (afecta al calendario).

#### Exercise Library (biblioteca)

Desde “Manage Exercises” puedes:

- Crear ejercicios.
- Borrar ejercicios.
- Renombrar ejercicios (actualiza globalmente el histórico).
- Gestionar tags asociados a ejercicios.

#### Routine Templates (plantillas)

- Incluye plantillas por defecto: PUSH, PULL, LOWER, UPPER, FULL BODY.
- Puedes crear rutinas nuevas, editar existentes o resetear a defaults.
- Desde “Workout” puedes aplicar una rutina con “+ Routine”.

#### Data Management (export y backups)

- Export CSV:
  - Selecciona un rango de fechas.
  - Pulsa “Export CSV” para descargar `gymaker-YYYY-MM-DD-YYYY-MM-DD.csv`.
- Backup & Restore:
  - “Copy Backup Code” copia un código con tu estado completo.
  - Pega el código en el textarea y usa “Restore Data” para restaurar.

## Instalación y desarrollo

### Requisitos

- Node.js (recomendado LTS)
- npm

### Ejecutar en local

```bash
npm install
npm run dev
```

### Build y preview

```bash
npm run build
npm run preview
```

### Otros scripts

```bash
npm run lint
npm run check
```

## Persistencia y privacidad

- Persistencia: Zustand + persist sobre localStorage.
- Clave principal: `localStorage["gymaker-v1"]`.
- Tus datos no salen del dispositivo salvo que exportes CSV o copies un Backup Code manualmente.

## PWA en iPhone (Add to Home Screen)

Actualmente el proyecto no incluye `manifest.webmanifest` ni service worker, así que no ofrece instalación PWA completa (modo standalone + iconos + offline) out-of-the-box.

Dicho esto, puedes añadirlo como acceso directo:

1. Abre la app desplegada en HTTPS con Safari en iPhone.
2. Botón Compartir (Share).
3. “Añadir a pantalla de inicio” (Add to Home Screen).

Para soporte PWA completo en iOS (iconos, standalone y cache offline), añade:

- `manifest.webmanifest` con icons + `display: standalone`.
- Apple meta tags (`apple-mobile-web-app-capable`, etc.) en `index.html`.
- Service Worker (por ejemplo, integrándolo con una solución compatible con Vite).

## Estructura del proyecto (resumen)

- [store.ts](file:///e:/PROJECTS/1-ON-PROD/gymaker/src/store.ts): estado global, persistencia, backup/restore, export CSV.
- [pages](file:///e:/PROJECTS/1-ON-PROD/gymaker/src/pages): páginas principales (Workout / Calendar / My Data / Settings).
- [components](file:///e:/PROJECTS/1-ON-PROD/gymaker/src/components): UI y componentes por dominio.
- [utils](file:///e:/PROJECTS/1-ON-PROD/gymaker/src/utils): fechas, PR engine (Brzycki), CSV, storage helpers.
