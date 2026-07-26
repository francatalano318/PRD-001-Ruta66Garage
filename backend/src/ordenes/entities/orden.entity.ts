import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

// Listas cerradas según RF-06 y RF-07 del PRD. "Sin clasificar" y "Sin
// asignar" son los valores de fallback cuando la IA falla (RF-23/RF-24).
export enum CategoriaOrden {
  MOTOR = 'Motor',
  FRENOS = 'Frenos',
  SUSPENSION = 'Suspensión',
  DIRECCION = 'Dirección',
  ELECTRICIDAD = 'Electricidad',
  TRANSMISION = 'Transmisión',
  OTRO = 'Otro',
  SIN_CLASIFICAR = 'Sin clasificar',
}

export enum PrioridadOrden {
  ALTA = 'Alta',
  MEDIA = 'Media',
  BAJA = 'Baja',
  SIN_ASIGNAR = 'Sin asignar',
}

// Lista cerrada de RF-17. La orden se crea siempre en "Abierta" (RF-05);
// las demás transiciones son parte de una feature futura, no de este slice.
export enum EstadoOrden {
  ABIERTA = 'Abierta',
  EN_DIAGNOSTICO = 'En diagnóstico',
  REPARANDO = 'Reparando',
  FINALIZADA = 'Finalizada',
}

@Entity('ordenes')
export class Orden {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  cliente: string;

  @Column({ type: 'varchar' })
  patente: string;

  @Column({ type: 'text' })
  descripcion: string;

  @Column({
    type: 'enum',
    enum: CategoriaOrden,
    enumName: 'categoria_orden',
    default: CategoriaOrden.SIN_CLASIFICAR,
  })
  categoria: CategoriaOrden;

  @Column({
    type: 'enum',
    enum: PrioridadOrden,
    enumName: 'prioridad_orden',
    default: PrioridadOrden.SIN_ASIGNAR,
  })
  prioridad: PrioridadOrden;

  @Column({
    type: 'enum',
    enum: EstadoOrden,
    enumName: 'estado_orden',
    default: EstadoOrden.ABIERTA,
  })
  estado: EstadoOrden;

  // RF-10: indica visualmente que la categoría fue asignada por IA.
  @Column({ name: 'categoria_asignada_por_ia', type: 'boolean', default: false })
  categoriaAsignadaPorIa: boolean;

  // RF-11: indica visualmente que la prioridad fue asignada por IA.
  @Column({ name: 'prioridad_asignada_por_ia', type: 'boolean', default: false })
  prioridadAsignadaPorIa: boolean;

  // RF-18: fecha/hora del último cambio de estado. Separada de "updatedAt"
  // porque esa también se actualiza al editar categoría/prioridad.
  @Column({ name: 'estado_actualizado_en', type: 'timestamptz', default: () => 'now()' })
  estadoActualizadoEn: Date;

  // RF-19: campo único que se pisa en cada edición (no un historial).
  @Column({ type: 'text', nullable: true })
  observaciones: string | null;

  // RNF-07: precisión de segundos (timestamptz cubre esto de sobra).
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
