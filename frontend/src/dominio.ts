// Listas cerradas de RF-06/RF-07, espejadas del backend (orden.entity.ts).
export const CATEGORIAS_ORDEN = [
  'Motor',
  'Frenos',
  'Suspensión',
  'Dirección',
  'Electricidad',
  'Transmisión',
  'Otro',
  'Sin clasificar',
] as const;

export const PRIORIDADES_ORDEN = ['Alta', 'Media', 'Baja', 'Sin asignar'] as const;

// Lista cerrada de RF-17, espejada del backend (orden.entity.ts).
export const ESTADOS_ORDEN = ['Abierta', 'En diagnóstico', 'Reparando', 'Finalizada'] as const;
