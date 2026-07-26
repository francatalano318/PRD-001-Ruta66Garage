import { API_URL } from './config';
import { obtenerToken } from '../auth/session';

export interface ClasificacionAutomaticaInfo {
  completada: false;
  mensaje: string;
}

export interface Orden {
  id: string;
  cliente: string;
  patente: string;
  descripcion: string;
  categoria: string;
  prioridad: string;
  estado: string;
  categoriaAsignadaPorIa: boolean;
  prioridadAsignadaPorIa: boolean;
  observaciones: string | null;
  createdAt: string;
  updatedAt: string;
  estadoActualizadoEn: string;
  clasificacionAutomatica?: ClasificacionAutomaticaInfo;
}

export interface CrearOrdenDatos {
  cliente: string;
  patente: string;
  descripcion: string;
}

// RF-13/14/15: filtros opcionales y combinables. '' equivale a "sin filtro".
export interface FiltrosOrdenes {
  pagina: number;
  estado?: string;
  categoria?: string;
  prioridad?: string;
}

export interface ListadoOrdenes {
  ordenes: Orden[];
  total: number;
  pagina: number;
  totalPaginas: number;
}

export class ErrorDeValidacion extends Error {
  constructor(public readonly mensajes: string[]) {
    super(mensajes.join(' '));
  }
}

// RF-02: el backend devuelve 401 si no hay token o dejó de ser válido.
export class ErrorDeSesion extends Error {}

// RF-16: la orden solicitada no existe.
export class ErrorNoEncontrado extends Error {}

function encabezados(): HeadersInit {
  const token = obtenerToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function manejarRespuesta<T>(response: Response): Promise<T> {
  if (response.status === 401) {
    throw new ErrorDeSesion('Tu sesión expiró o no es válida. Iniciá sesión de nuevo.');
  }

  if (response.status === 404) {
    throw new ErrorNoEncontrado('La orden solicitada no existe.');
  }

  if (response.status === 400) {
    const cuerpo = await response.json();
    const mensajes = Array.isArray(cuerpo.message) ? cuerpo.message : [cuerpo.message];
    throw new ErrorDeValidacion(mensajes);
  }

  if (!response.ok) {
    throw new Error('No se pudo completar la operación. Intentá de nuevo en unos segundos.');
  }

  return response.json();
}

export async function crearOrden(datos: CrearOrdenDatos): Promise<Orden> {
  const response = await fetch(`${API_URL}/ordenes`, {
    method: 'POST',
    headers: encabezados(),
    body: JSON.stringify(datos),
  });
  return manejarRespuesta<Orden>(response);
}

// RF-08
export async function actualizarCategoria(id: string, categoria: string): Promise<Orden> {
  const response = await fetch(`${API_URL}/ordenes/${id}/categoria`, {
    method: 'PATCH',
    headers: encabezados(),
    body: JSON.stringify({ categoria }),
  });
  return manejarRespuesta<Orden>(response);
}

// RF-09
export async function actualizarPrioridad(id: string, prioridad: string): Promise<Orden> {
  const response = await fetch(`${API_URL}/ordenes/${id}/prioridad`, {
    method: 'PATCH',
    headers: encabezados(),
    body: JSON.stringify({ prioridad }),
  });
  return manejarRespuesta<Orden>(response);
}

// RF-12 a RF-15
export async function listarOrdenes(filtros: FiltrosOrdenes): Promise<ListadoOrdenes> {
  const parametros = new URLSearchParams({ pagina: String(filtros.pagina) });
  if (filtros.estado) parametros.set('estado', filtros.estado);
  if (filtros.categoria) parametros.set('categoria', filtros.categoria);
  if (filtros.prioridad) parametros.set('prioridad', filtros.prioridad);

  const response = await fetch(`${API_URL}/ordenes?${parametros.toString()}`, {
    headers: encabezados(),
  });
  return manejarRespuesta<ListadoOrdenes>(response);
}

// RF-17/RF-18
export async function actualizarEstado(id: string, estado: string): Promise<Orden> {
  const response = await fetch(`${API_URL}/ordenes/${id}/estado`, {
    method: 'PATCH',
    headers: encabezados(),
    body: JSON.stringify({ estado }),
  });
  return manejarRespuesta<Orden>(response);
}

// RF-19
export async function actualizarObservaciones(id: string, observaciones: string): Promise<Orden> {
  const response = await fetch(`${API_URL}/ordenes/${id}/observaciones`, {
    method: 'PATCH',
    headers: encabezados(),
    body: JSON.stringify({ observaciones }),
  });
  return manejarRespuesta<Orden>(response);
}

// RF-16
export async function obtenerOrden(id: string): Promise<Orden> {
  const response = await fetch(`${API_URL}/ordenes/${id}`, {
    headers: encabezados(),
  });
  return manejarRespuesta<Orden>(response);
}
