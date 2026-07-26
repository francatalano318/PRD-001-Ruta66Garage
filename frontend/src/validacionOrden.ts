import { CrearOrdenDatos } from './api/ordenes';

export type ErroresFormulario = Partial<Record<keyof CrearOrdenDatos, string>>;

// Espeja a nivel de UI las validaciones del backend (RF-20/RF-21), para dar
// feedback inmediato sin esperar el round-trip; el backend sigue siendo la
// fuente de verdad (ver manejo de 400 en api/ordenes.ts).
export function validarDatosOrden(datos: CrearOrdenDatos): ErroresFormulario {
  const errores: ErroresFormulario = {};

  if (!datos.cliente.trim()) {
    errores.cliente = 'El cliente es obligatorio.';
  }
  if (!datos.patente.trim()) {
    errores.patente = 'La patente es obligatoria.';
  }
  if (datos.descripcion.trim().length < 10) {
    errores.descripcion = 'La descripción es inválida: debe tener al menos 10 caracteres.';
  }

  return errores;
}
