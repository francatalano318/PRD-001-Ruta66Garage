import { CategoriaOrden, PrioridadOrden } from '../entities/orden.entity';

export interface ClasificacionIa {
  categoria: CategoriaOrden;
  prioridad: PrioridadOrden;
}

export interface ClasificacionIaPort {
  clasificar(descripcion: string): Promise<ClasificacionIa>;
}

export const CLASIFICACION_IA_PORT = Symbol('CLASIFICACION_IA_PORT');
