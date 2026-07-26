import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { CategoriaOrden, PrioridadOrden } from '../entities/orden.entity';
import { ClasificacionIa, ClasificacionIaPort } from './clasificacion-ia.port';

// "Sin clasificar" / "Sin asignar" son valores de fallback (RF-23/RF-24),
// no algo que el modelo deba elegir: no forman parte de este schema.
const CATEGORIAS_CLASIFICABLES = [
  CategoriaOrden.MOTOR,
  CategoriaOrden.FRENOS,
  CategoriaOrden.SUSPENSION,
  CategoriaOrden.DIRECCION,
  CategoriaOrden.ELECTRICIDAD,
  CategoriaOrden.TRANSMISION,
  CategoriaOrden.OTRO,
];

const PRIORIDADES_CLASIFICABLES = [
  PrioridadOrden.ALTA,
  PrioridadOrden.MEDIA,
  PrioridadOrden.BAJA,
];

@Injectable()
export class OpenAiClasificacionIaService implements ClasificacionIaPort {
  private readonly client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  private readonly model = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';

  async clasificar(descripcion: string): Promise<ClasificacionIa> {
    const completion = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: 'system',
          content:
            'Clasificás incidencias reportadas en un taller mecánico. ' +
            'A partir de la descripción del cliente, asigná la categoría y ' +
            'la prioridad de reparación más adecuadas.',
        },
        { role: 'user', content: descripcion },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'clasificacion_orden',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              categoria: { type: 'string', enum: CATEGORIAS_CLASIFICABLES },
              prioridad: { type: 'string', enum: PRIORIDADES_CLASIFICABLES },
            },
            required: ['categoria', 'prioridad'],
            additionalProperties: false,
          },
        },
      },
    });

    const contenido = completion.choices[0]?.message?.content;
    if (!contenido) {
      throw new Error('El servicio de clasificación no devolvió contenido.');
    }

    return JSON.parse(contenido) as ClasificacionIa;
  }
}
