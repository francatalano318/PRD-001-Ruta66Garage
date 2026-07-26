import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Orden } from './entities/orden.entity';
import { OrdenesController } from './ordenes.controller';
import { OrdenesService } from './ordenes.service';
import { CLASIFICACION_IA_PORT } from './ia/clasificacion-ia.port';
import { OpenAiClasificacionIaService } from './ia/openai-clasificacion-ia.service';

@Module({
  imports: [TypeOrmModule.forFeature([Orden])],
  controllers: [OrdenesController],
  providers: [
    OrdenesService,
    { provide: CLASIFICACION_IA_PORT, useClass: OpenAiClasificacionIaService },
  ],
})
export class OrdenesModule {}
