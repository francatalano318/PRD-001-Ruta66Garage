import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoriaOrden, EstadoOrden, Orden, PrioridadOrden } from './entities/orden.entity';
import { CreateOrdenDto } from './dto/create-orden.dto';
import { QueryOrdenesDto } from './dto/query-ordenes.dto';
import { CLASIFICACION_IA_PORT, ClasificacionIaPort } from './ia/clasificacion-ia.port';

export interface CrearOrdenResultado {
  orden: Orden;
  clasificacionAutomaticaFallo: boolean;
}

// RNF-08: tamaño de página fijo, no configurable por query.
const TAMANIO_PAGINA = 20;

export interface ListadoOrdenes {
  ordenes: Orden[];
  total: number;
  pagina: number;
  totalPaginas: number;
}

@Injectable()
export class OrdenesService {
  private readonly logger = new Logger(OrdenesService.name);

  constructor(
    @InjectRepository(Orden)
    private readonly ordenesRepository: Repository<Orden>,
    @Inject(CLASIFICACION_IA_PORT)
    private readonly clasificacionIa: ClasificacionIaPort,
  ) {}

  async create(dto: CreateOrdenDto): Promise<CrearOrdenResultado> {
    let categoria = CategoriaOrden.SIN_CLASIFICAR;
    let prioridad = PrioridadOrden.SIN_ASIGNAR;
    let categoriaAsignadaPorIa = false;
    let prioridadAsignadaPorIa = false;
    let clasificacionAutomaticaFallo = false;

    try {
      const clasificacion = await this.clasificacionIa.clasificar(dto.descripcion);
      categoria = clasificacion.categoria;
      prioridad = clasificacion.prioridad;
      categoriaAsignadaPorIa = true;
      prioridadAsignadaPorIa = true;
    } catch (error) {
      // RF-23/RF-24: una falla de la IA no debe bloquear la creación de la
      // orden; queda "Sin clasificar" / "Sin asignar" para completar a mano.
      clasificacionAutomaticaFallo = true;
      this.logger.warn(
        `Clasificación automática no disponible, se crea la orden sin clasificar: ${error instanceof Error ? error.message : error}`,
      );
    }

    const orden = this.ordenesRepository.create({
      cliente: dto.cliente,
      patente: dto.patente,
      descripcion: dto.descripcion,
      categoria,
      prioridad,
      categoriaAsignadaPorIa,
      prioridadAsignadaPorIa,
    });
    const guardada = await this.ordenesRepository.save(orden);

    return { orden: guardada, clasificacionAutomaticaFallo };
  }

  // RF-12 a RF-15: listado paginado con filtros combinables (AND) por
  // estado, categoría y prioridad. Orden por fecha de creación descendente.
  async listar(query: QueryOrdenesDto): Promise<ListadoOrdenes> {
    const [ordenes, total] = await this.ordenesRepository.findAndCount({
      where: {
        ...(query.estado ? { estado: query.estado } : {}),
        ...(query.categoria ? { categoria: query.categoria } : {}),
        ...(query.prioridad ? { prioridad: query.prioridad } : {}),
      },
      order: { createdAt: 'DESC' },
      take: TAMANIO_PAGINA,
      skip: (query.pagina - 1) * TAMANIO_PAGINA,
    });

    return {
      ordenes,
      total,
      pagina: query.pagina,
      totalPaginas: Math.max(1, Math.ceil(total / TAMANIO_PAGINA)),
    };
  }

  // RF-16: detalle completo de una orden.
  async buscarPorId(id: string): Promise<Orden> {
    return this.buscarOrFail(id);
  }

  // RF-08: al corregir la categoría a mano, deja de estar "asignada por IA"
  // (RF-10 ya no debe indicarlo como tal).
  async actualizarCategoria(id: string, categoria: CategoriaOrden): Promise<Orden> {
    const orden = await this.buscarOrFail(id);
    orden.categoria = categoria;
    orden.categoriaAsignadaPorIa = false;
    return this.ordenesRepository.save(orden);
  }

  // RF-09: análogo a actualizarCategoria, para prioridad (RF-11).
  async actualizarPrioridad(id: string, prioridad: PrioridadOrden): Promise<Orden> {
    const orden = await this.buscarOrFail(id);
    orden.prioridad = prioridad;
    orden.prioridadAsignadaPorIa = false;
    return this.ordenesRepository.save(orden);
  }

  // RF-17/RF-18: el estado a asignar debe ser uno de los 4 cerrados; cada
  // cambio actualiza "estadoActualizadoEn" (distinto de "updatedAt").
  async actualizarEstado(id: string, estado: EstadoOrden): Promise<Orden> {
    const orden = await this.buscarOrFail(id);
    orden.estado = estado;
    orden.estadoActualizadoEn = new Date();
    return this.ordenesRepository.save(orden);
  }

  // RF-19: campo único que se pisa en cada edición.
  async actualizarObservaciones(id: string, observaciones: string): Promise<Orden> {
    const orden = await this.buscarOrFail(id);
    orden.observaciones = observaciones;
    return this.ordenesRepository.save(orden);
  }

  private async buscarOrFail(id: string): Promise<Orden> {
    const orden = await this.ordenesRepository.findOneBy({ id });
    if (!orden) {
      throw new NotFoundException(`No existe una orden con id "${id}".`);
    }
    return orden;
  }
}
