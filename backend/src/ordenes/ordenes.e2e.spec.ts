import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import request from 'supertest';
import { AppModule } from '../app.module';
import { CategoriaOrden, Orden, PrioridadOrden } from './entities/orden.entity';
import { CLASIFICACION_IA_PORT, ClasificacionIaPort } from './ia/clasificacion-ia.port';

// Test de integración: requiere el Postgres de docker-compose corriendo, la
// migración aplicada y el usuario sembrado (ver README del paso 1 de auth).
// El servicio de IA real se reemplaza por un fake (ver abajo): esto valida
// la orquestación del endpoint (RF-03, RF-06, RF-07, RF-10, RF-11, RF-20,
// RF-21, RF-22, RF-23, RF-24), no el comportamiento real de OpenAI — eso se
// cubre en ia/openai-clasificacion-ia.service.real.spec.ts.
let simularFalloIa = false;
const clasificacionIaFake: ClasificacionIaPort = {
  clasificar: async () => {
    if (simularFalloIa) {
      throw new Error('Fallo simulado del servicio de IA (ej: 429 de OpenAI)');
    }
    return { categoria: CategoriaOrden.FRENOS, prioridad: PrioridadOrden.ALTA };
  },
};

describe('POST /ordenes (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let token: string;

  function post(url: string) {
    return request(app.getHttpServer()).post(url).set('Authorization', `Bearer ${token}`);
  }

  function patch(url: string) {
    return request(app.getHttpServer()).patch(url).set('Authorization', `Bearer ${token}`);
  }

  function get(url: string) {
    return request(app.getHttpServer()).get(url).set('Authorization', `Bearer ${token}`);
  }

  async function crearOrden(overrides: Partial<{ cliente: string; patente: string; descripcion: string }> = {}) {
    const response = await post('/ordenes')
      .send({
        cliente: 'Juan Pérez',
        patente: 'AA123BB',
        descripcion: 'Ruido al frenar en curvas cerradas',
        ...overrides,
      })
      .expect(201);
    return response.body;
  }

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(CLASIFICACION_IA_PORT)
      .useValue(clasificacionIaFake)
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    dataSource = moduleRef.get(DataSource);

    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@ruta66garage.com', password: 'Ruta66Garage#2026' })
      .expect(200);
    token = login.body.accessToken;
  });

  beforeEach(() => {
    simularFalloIa = false;
  });

  afterEach(async () => {
    await dataSource.getRepository(Orden).clear();
  });

  afterAll(async () => {
    await app.close();
  });

  it('crea la orden con la categoría y prioridad que asigna la IA (RF-03/RF-06/RF-07 / AC-03)', async () => {
    const response = await post('/ordenes')
      .send({
        cliente: 'Juan Pérez',
        patente: 'AA123BB',
        descripcion: 'Ruido al frenar en curvas cerradas',
      })
      .expect(201);

    expect(response.body.id).toBeDefined();
    expect(response.body.estado).toBe('Abierta');
    expect(response.body.categoria).toBe('Frenos');
    expect(response.body.prioridad).toBe('Alta');
    expect(response.body.clasificacionAutomatica).toBeUndefined();
  });

  it('marca la categoría y la prioridad como asignadas por IA (RF-10 / RF-11)', async () => {
    const response = await post('/ordenes')
      .send({
        cliente: 'Juan Pérez',
        patente: 'AA123BB',
        descripcion: 'Ruido al frenar en curvas cerradas',
      })
      .expect(201);

    expect(response.body.categoriaAsignadaPorIa).toBe(true);
    expect(response.body.prioridadAsignadaPorIa).toBe(true);
  });

  it('rechaza la creación cuando la patente está vacía, sin llamar a la IA (RF-20 / AC-20)', async () => {
    const response = await post('/ordenes')
      .send({
        cliente: 'Juan Pérez',
        patente: '',
        descripcion: 'Ruido al frenar en curvas cerradas',
      })
      .expect(400);

    expect(JSON.stringify(response.body.message)).toContain(
      'La patente es obligatoria.',
    );
  });

  it('rechaza la creación cuando la descripción tiene menos de 10 caracteres (RF-21 / AC-21)', async () => {
    const response = await post('/ordenes')
      .send({
        cliente: 'Juan Pérez',
        patente: 'AA123BB',
        descripcion: 'Muy corta',
      })
      .expect(400);

    expect(JSON.stringify(response.body.message)).toContain(
      'La descripción es inválida',
    );
  });

  it('rechaza la creación sin un token de autenticación (RF-02 / AC-02)', async () => {
    await request(app.getHttpServer())
      .post('/ordenes')
      .send({
        cliente: 'Juan Pérez',
        patente: 'AA123BB',
        descripcion: 'Ruido al frenar en curvas cerradas',
      })
      .expect(401);
  });

  describe('cuando el servicio de clasificación automática falla', () => {
    beforeEach(() => {
      simularFalloIa = true;
    });

    it('crea la orden igual, sin bloquear el registro (RF-23 / AC-23: categoría "Sin clasificar")', async () => {
      const response = await post('/ordenes')
        .send({
          cliente: 'Juan Pérez',
          patente: 'AA123BB',
          descripcion: 'Ruido al frenar en curvas cerradas',
        })
        .expect(201);

      expect(response.body.id).toBeDefined();
      expect(response.body.categoria).toBe('Sin clasificar');
      expect(response.body.categoriaAsignadaPorIa).toBe(false);
    });

    it('crea la orden sin prioridad asignada (RF-24 / AC-24)', async () => {
      const response = await post('/ordenes')
        .send({
          cliente: 'Juan Pérez',
          patente: 'AA123BB',
          descripcion: 'Ruido al frenar en curvas cerradas',
        })
        .expect(201);

      expect(response.body.prioridad).toBe('Sin asignar');
      expect(response.body.prioridadAsignadaPorIa).toBe(false);
    });

    it('informa al usuario que la clasificación automática no pudo completarse (RF-22 / AC-22)', async () => {
      const response = await post('/ordenes')
        .send({
          cliente: 'Juan Pérez',
          patente: 'AA123BB',
          descripcion: 'Ruido al frenar en curvas cerradas',
        })
        .expect(201);

      expect(response.body.clasificacionAutomatica).toMatchObject({
        completada: false,
      });
      expect(response.body.clasificacionAutomatica.mensaje).toMatch(
        /no pudo completarse/i,
      );
    });
  });

  describe('PATCH /ordenes/:id/categoria (RF-08 / AC-08)', () => {
    it('modifica la categoría asignada automáticamente', async () => {
      const creada = await post('/ordenes')
        .send({
          cliente: 'Juan Pérez',
          patente: 'AA123BB',
          descripcion: 'Ruido al frenar en curvas cerradas',
        })
        .expect(201);

      const response = await patch(`/ordenes/${creada.body.id}/categoria`)
        .send({ categoria: 'Electricidad' })
        .expect(200);

      expect(response.body.categoria).toBe('Electricidad');
      expect(response.body.categoriaAsignadaPorIa).toBe(false);
    });

    it('rechaza una categoría fuera de la lista cerrada de RF-06', async () => {
      const creada = await post('/ordenes')
        .send({
          cliente: 'Juan Pérez',
          patente: 'AA123BB',
          descripcion: 'Ruido al frenar en curvas cerradas',
        })
        .expect(201);

      await patch(`/ordenes/${creada.body.id}/categoria`)
        .send({ categoria: 'Categoria Inventada' })
        .expect(400);
    });

    it('devuelve 404 si la orden no existe', async () => {
      await patch('/ordenes/00000000-0000-0000-0000-000000000000/categoria')
        .send({ categoria: 'Motor' })
        .expect(404);
    });
  });

  describe('PATCH /ordenes/:id/prioridad (RF-09 / AC-09)', () => {
    it('modifica la prioridad asignada automáticamente', async () => {
      const creada = await post('/ordenes')
        .send({
          cliente: 'Juan Pérez',
          patente: 'AA123BB',
          descripcion: 'Ruido al frenar en curvas cerradas',
        })
        .expect(201);

      const response = await patch(`/ordenes/${creada.body.id}/prioridad`)
        .send({ prioridad: 'Media' })
        .expect(200);

      expect(response.body.prioridad).toBe('Media');
      expect(response.body.prioridadAsignadaPorIa).toBe(false);
    });

    it('rechaza una prioridad fuera de la lista cerrada de RF-07', async () => {
      const creada = await post('/ordenes')
        .send({
          cliente: 'Juan Pérez',
          patente: 'AA123BB',
          descripcion: 'Ruido al frenar en curvas cerradas',
        })
        .expect(201);

      await patch(`/ordenes/${creada.body.id}/prioridad`)
        .send({ prioridad: 'Urgentísima' })
        .expect(400);
    });

    it('devuelve 404 si la orden no existe', async () => {
      await patch('/ordenes/00000000-0000-0000-0000-000000000000/prioridad')
        .send({ prioridad: 'Alta' })
        .expect(404);
    });
  });

  describe('GET /ordenes (RF-12/13/14/15, RNF-08)', () => {
    it('rechaza el acceso sin token (RF-02 / AC-02)', async () => {
      await request(app.getHttpServer()).get('/ordenes').expect(401);
    });

    it('devuelve un máximo de 20 órdenes por página (RNF-08 / AC-12)', async () => {
      for (let i = 0; i < 21; i++) {
        await crearOrden();
      }

      const primeraPagina = await get('/ordenes').expect(200);
      expect(primeraPagina.body.ordenes).toHaveLength(20);
      expect(primeraPagina.body.total).toBe(21);
      expect(primeraPagina.body.pagina).toBe(1);
      expect(primeraPagina.body.totalPaginas).toBe(2);

      const segundaPagina = await get('/ordenes?pagina=2').expect(200);
      expect(segundaPagina.body.ordenes).toHaveLength(1);
      expect(segundaPagina.body.pagina).toBe(2);
    });

    it('filtra por categoría (RF-14 / AC-14)', async () => {
      const frenos = await crearOrden();
      const motor = await crearOrden();
      await patch(`/ordenes/${motor.id}/categoria`).send({ categoria: 'Motor' }).expect(200);

      const response = await get('/ordenes?categoria=Frenos').expect(200);

      expect(response.body.ordenes).toHaveLength(1);
      expect(response.body.ordenes[0].id).toBe(frenos.id);
    });

    it('filtra por prioridad (RF-15 / AC-15)', async () => {
      const alta = await crearOrden();
      const baja = await crearOrden();
      await patch(`/ordenes/${baja.id}/prioridad`).send({ prioridad: 'Baja' }).expect(200);

      const response = await get('/ordenes?prioridad=Alta').expect(200);

      expect(response.body.ordenes).toHaveLength(1);
      expect(response.body.ordenes[0].id).toBe(alta.id);
    });

    it('filtra por estado (RF-13 / AC-13)', async () => {
      await crearOrden();

      const abiertas = await get('/ordenes?estado=Abierta').expect(200);
      expect(abiertas.body.ordenes).toHaveLength(1);

      const reparando = await get('/ordenes?estado=Reparando').expect(200);
      expect(reparando.body.ordenes).toHaveLength(0);
    });

    it('combina filtros con AND', async () => {
      const objetivo = await crearOrden();
      const otra = await crearOrden();
      await patch(`/ordenes/${otra.id}/categoria`).send({ categoria: 'Motor' }).expect(200);

      const response = await get('/ordenes?estado=Abierta&categoria=Frenos&prioridad=Alta').expect(
        200,
      );

      expect(response.body.ordenes).toHaveLength(1);
      expect(response.body.ordenes[0].id).toBe(objetivo.id);
    });

    it('rechaza un valor de filtro fuera de la lista cerrada', async () => {
      await get('/ordenes?categoria=Inventada').expect(400);
    });
  });

  describe('GET /ordenes/:id (RF-16 / AC-16)', () => {
    it('rechaza el acceso sin token (RF-02 / AC-02)', async () => {
      const creada = await crearOrden();
      await request(app.getHttpServer()).get(`/ordenes/${creada.id}`).expect(401);
    });

    it('muestra el detalle completo de la orden', async () => {
      const creada = await crearOrden();

      const response = await get(`/ordenes/${creada.id}`).expect(200);

      expect(response.body).toMatchObject({
        id: creada.id,
        cliente: 'Juan Pérez',
        patente: 'AA123BB',
        descripcion: 'Ruido al frenar en curvas cerradas',
        categoria: 'Frenos',
        prioridad: 'Alta',
        estado: 'Abierta',
      });
    });

    it('devuelve 404 si la orden no existe', async () => {
      await get('/ordenes/00000000-0000-0000-0000-000000000000').expect(404);
    });
  });

  describe('PATCH /ordenes/:id/estado (RF-17 / AC-17)', () => {
    it('cambia el estado de la orden', async () => {
      const creada = await crearOrden();

      const response = await patch(`/ordenes/${creada.id}/estado`)
        .send({ estado: 'En diagnóstico' })
        .expect(200);

      expect(response.body.estado).toBe('En diagnóstico');
    });

    it('registra la fecha y hora del cambio de estado (RF-18 / AC-18)', async () => {
      const creada = await crearOrden();
      const estadoActualizadoEnOriginal = creada.estadoActualizadoEn;

      const response = await patch(`/ordenes/${creada.id}/estado`)
        .send({ estado: 'Reparando' })
        .expect(200);

      expect(response.body.estadoActualizadoEn).toBeDefined();
      expect(new Date(response.body.estadoActualizadoEn).getTime()).toBeGreaterThan(
        new Date(estadoActualizadoEnOriginal).getTime(),
      );
    });

    it('rechaza un estado fuera de la lista cerrada de RF-17', async () => {
      const creada = await crearOrden();

      await patch(`/ordenes/${creada.id}/estado`)
        .send({ estado: 'Cancelada' })
        .expect(400);
    });

    it('devuelve 404 si la orden no existe', async () => {
      await patch('/ordenes/00000000-0000-0000-0000-000000000000/estado')
        .send({ estado: 'Abierta' })
        .expect(404);
    });

    it('rechaza el acceso sin token (RF-02 / AC-02)', async () => {
      const creada = await crearOrden();
      await request(app.getHttpServer())
        .patch(`/ordenes/${creada.id}/estado`)
        .send({ estado: 'Abierta' })
        .expect(401);
    });
  });

  describe('PATCH /ordenes/:id/observaciones (RF-19 / AC-19)', () => {
    it('agrega una observación a la orden', async () => {
      const creada = await crearOrden();

      const response = await patch(`/ordenes/${creada.id}/observaciones`)
        .send({ observaciones: 'Cliente avisa que el ruido empeoró.' })
        .expect(200);

      expect(response.body.observaciones).toBe('Cliente avisa que el ruido empeoró.');
    });

    it('pisa la observación anterior con la nueva', async () => {
      const creada = await crearOrden();
      await patch(`/ordenes/${creada.id}/observaciones`)
        .send({ observaciones: 'Primera observación.' })
        .expect(200);

      const response = await patch(`/ordenes/${creada.id}/observaciones`)
        .send({ observaciones: 'Segunda observación.' })
        .expect(200);

      expect(response.body.observaciones).toBe('Segunda observación.');
    });

    it('devuelve 404 si la orden no existe', async () => {
      await patch('/ordenes/00000000-0000-0000-0000-000000000000/observaciones')
        .send({ observaciones: 'Texto' })
        .expect(404);
    });

    it('rechaza el acceso sin token (RF-02 / AC-02)', async () => {
      const creada = await crearOrden();
      await request(app.getHttpServer())
        .patch(`/ordenes/${creada.id}/observaciones`)
        .send({ observaciones: 'Texto' })
        .expect(401);
    });
  });
});
