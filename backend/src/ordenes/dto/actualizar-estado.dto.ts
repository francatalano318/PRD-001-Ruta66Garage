import { IsEnum } from 'class-validator';
import { EstadoOrden } from '../entities/orden.entity';

// RF-17: el estado a asignar debe ser uno de los 4 estados cerrados.
export class ActualizarEstadoDto {
  @IsEnum(EstadoOrden)
  estado: EstadoOrden;
}
