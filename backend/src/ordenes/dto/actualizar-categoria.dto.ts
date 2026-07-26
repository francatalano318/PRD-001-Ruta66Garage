import { IsEnum } from 'class-validator';
import { CategoriaOrden } from '../entities/orden.entity';

// RF-08: la categoría a asignar manualmente debe ser una de la lista
// cerrada de RF-06 (incluye "Sin clasificar" para poder revertir a esa).
export class ActualizarCategoriaDto {
  @IsEnum(CategoriaOrden)
  categoria: CategoriaOrden;
}
