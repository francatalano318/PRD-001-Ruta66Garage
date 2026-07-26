import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { CategoriaOrden, EstadoOrden, PrioridadOrden } from '../entities/orden.entity';

// RF-13/14/15: filtros opcionales y combinables (AND) por estado, categoría
// y prioridad. RF-12/RNF-08: paginado, 20 órdenes fijas por página.
export class QueryOrdenesDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pagina: number = 1;

  @IsOptional()
  @IsEnum(EstadoOrden)
  estado?: EstadoOrden;

  @IsOptional()
  @IsEnum(CategoriaOrden)
  categoria?: CategoriaOrden;

  @IsOptional()
  @IsEnum(PrioridadOrden)
  prioridad?: PrioridadOrden;
}
