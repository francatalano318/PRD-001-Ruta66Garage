import { OpenAiClasificacionIaService } from './openai-clasificacion-ia.service';
import { CategoriaOrden, PrioridadOrden } from '../entities/orden.entity';

// Test real contra la API de OpenAI (no un fake): valida los casos no
// ambiguos de AC-06 y AC-07 del PRD. Se salta automáticamente si no hay
// OPENAI_API_KEY en el entorno (el propio cliente de OpenAI arroja al
// instanciarse sin key, por eso el describe entero queda condicionado).
// Recordatorio del PRD: esto ilustra el caso no ambiguo, no garantiza el
// comportamiento en el 100% de los casos (la precisión agregada es RNF-04).
const tieneApiKey = !!process.env.OPENAI_API_KEY;
const maybeDescribe = tieneApiKey ? describe : describe.skip;

maybeDescribe('OpenAiClasificacionIaService (integración real con OpenAI)', () => {
  let service: OpenAiClasificacionIaService;

  beforeAll(() => {
    service = new OpenAiClasificacionIaService();
  });

  it(
    'clasifica "el vehículo hace ruido al frenar" como categoría Frenos (AC-06)',
    async () => {
      const resultado = await service.clasificar('el vehículo hace ruido al frenar');
      expect(resultado.categoria).toBe(CategoriaOrden.FRENOS);
    },
    15000,
  );

  it(
    'clasifica "el vehículo no responde al pedal de freno" como prioridad Alta (AC-07)',
    async () => {
      const resultado = await service.clasificar(
        'el vehículo no responde al pedal de freno',
      );
      expect(resultado.prioridad).toBe(PrioridadOrden.ALTA);
    },
    15000,
  );
});

if (!tieneApiKey) {
  describe('OpenAiClasificacionIaService (integración real con OpenAI)', () => {
    it('se salta: seteá OPENAI_API_KEY para correr este archivo contra la API real', () => {
      expect(tieneApiKey).toBe(false);
    });
  });
}
