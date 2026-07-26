import { IsEnum } from 'class-validator';
import { PrioridadOrden } from '../entities/orden.entity';

// RF-09: la prioridad a asignar manualmente debe ser una de la lista
// cerrada de RF-07 (incluye "Sin asignar" para poder revertir a esa).
export class ActualizarPrioridadDto {
  @IsEnum(PrioridadOrden)
  prioridad: PrioridadOrden;
}
