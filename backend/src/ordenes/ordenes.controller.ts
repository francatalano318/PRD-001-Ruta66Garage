import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';
import { OrdenesService } from './ordenes.service';
import { CreateOrdenDto } from './dto/create-orden.dto';
import { ActualizarCategoriaDto } from './dto/actualizar-categoria.dto';
import { ActualizarPrioridadDto } from './dto/actualizar-prioridad.dto';
import { ActualizarEstadoDto } from './dto/actualizar-estado.dto';
import { ActualizarObservacionesDto } from './dto/actualizar-observaciones.dto';
import { QueryOrdenesDto } from './dto/query-ordenes.dto';

@Controller('ordenes')
export class OrdenesController {
  constructor(private readonly ordenesService: OrdenesService) {}

  // RF-12 a RF-15, RNF-05, RNF-08.
  @Get()
  listar(@Query() query: QueryOrdenesDto) {
    return this.ordenesService.listar(query);
  }

  // RF-16.
  @Get(':id')
  buscarPorId(@Param('id') id: string) {
    return this.ordenesService.buscarPorId(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateOrdenDto) {
    const { orden, clasificacionAutomaticaFallo } = await this.ordenesService.create(dto);

    if (!clasificacionAutomaticaFallo) {
      return orden;
    }

    // RF-22: informar al usuario cuando la clasificación automática no
    // pudo completarse (la orden ya se creó de todos modos, ver RF-23/24).
    return {
      ...orden,
      clasificacionAutomatica: {
        completada: false,
        mensaje:
          'La clasificación automática no pudo completarse. La orden se creó sin categoría ni prioridad asignadas; podés completarlas manualmente.',
      },
    };
  }

  @Patch(':id/categoria')
  actualizarCategoria(@Param('id') id: string, @Body() dto: ActualizarCategoriaDto) {
    return this.ordenesService.actualizarCategoria(id, dto.categoria);
  }

  @Patch(':id/prioridad')
  actualizarPrioridad(@Param('id') id: string, @Body() dto: ActualizarPrioridadDto) {
    return this.ordenesService.actualizarPrioridad(id, dto.prioridad);
  }

  // RF-17/RF-18.
  @Patch(':id/estado')
  actualizarEstado(@Param('id') id: string, @Body() dto: ActualizarEstadoDto) {
    return this.ordenesService.actualizarEstado(id, dto.estado);
  }

  // RF-19.
  @Patch(':id/observaciones')
  actualizarObservaciones(@Param('id') id: string, @Body() dto: ActualizarObservacionesDto) {
    return this.ordenesService.actualizarObservaciones(id, dto.observaciones);
  }
}
