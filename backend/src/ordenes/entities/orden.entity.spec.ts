import { DataSource } from 'typeorm';
import {
  CategoriaOrden,
  EstadoOrden,
  Orden,
  PrioridadOrden,
} from './orden.entity';
import { CreateOrdenesTable1753200000000 } from '../../migrations/1753200000000-CreateOrdenesTable';

// Test de integración: requiere el Postgres de docker-compose corriendo
// (ver docker-compose.yml en la raíz). Verifica el modelo de datos de la
// feature core, sin pasar todavía por el endpoint HTTP (eso es el paso 2).
describe('Orden (modelo de datos)', () => {
  let dataSource: DataSource;

  beforeAll(async () => {
    dataSource = new DataSource({
      type: 'postgres',
      host: process.env.DB_HOST ?? 'localhost',
      port: Number(process.env.DB_PORT ?? 5432),
      username: process.env.DB_USER ?? 'ruta66',
      password: process.env.DB_PASSWORD ?? 'ruta66',
      database: process.env.DB_NAME ?? 'ruta66garage',
      entities: [Orden],
      migrations: [CreateOrdenesTable1753200000000],
    });
    await dataSource.initialize();
    await dataSource.runMigrations();
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  afterEach(async () => {
    await dataSource.getRepository(Orden).clear();
  });

  it('asigna un id único a cada orden creada (RF-04 / AC-04)', async () => {
    const repo = dataSource.getRepository(Orden);
    const orden1 = await repo.save(
      repo.create({ cliente: 'Juan Pérez', patente: 'AA123BB', descripcion: 'Ruido al frenar' }),
    );
    const orden2 = await repo.save(
      repo.create({ cliente: 'Ana Gómez', patente: 'AC456DE', descripcion: 'Pierde aceite de motor' }),
    );

    expect(orden1.id).toBeDefined();
    expect(orden2.id).toBeDefined();
    expect(orden1.id).not.toEqual(orden2.id);
  });

  it('asigna el estado inicial "Abierta" (RF-05 / AC-05)', async () => {
    const repo = dataSource.getRepository(Orden);
    const orden = await repo.save(
      repo.create({ cliente: 'Juan Pérez', patente: 'AA123BB', descripcion: 'Ruido al frenar' }),
    );

    expect(orden.estado).toBe(EstadoOrden.ABIERTA);
  });

  it('sin intervención de la IA, categoría y prioridad quedan en sus valores de fallback', async () => {
    const repo = dataSource.getRepository(Orden);
    const orden = await repo.save(
      repo.create({ cliente: 'Juan Pérez', patente: 'AA123BB', descripcion: 'Ruido al frenar' }),
    );

    expect(orden.categoria).toBe(CategoriaOrden.SIN_CLASIFICAR);
    expect(orden.prioridad).toBe(PrioridadOrden.SIN_ASIGNAR);
    expect(orden.categoriaAsignadaPorIa).toBe(false);
    expect(orden.prioridadAsignadaPorIa).toBe(false);
  });

  it('registra createdAt y updatedAt con precisión de al menos segundos (RNF-07)', async () => {
    const repo = dataSource.getRepository(Orden);
    const orden = await repo.save(
      repo.create({ cliente: 'Juan Pérez', patente: 'AA123BB', descripcion: 'Ruido al frenar' }),
    );

    expect(orden.createdAt).toBeInstanceOf(Date);
    expect(orden.updatedAt).toBeInstanceOf(Date);
  });

  it('rechaza a nivel de base de datos una categoría fuera de la lista cerrada (RF-06)', async () => {
    await expect(
      dataSource.query(
        `INSERT INTO ordenes (cliente, patente, descripcion, categoria)
         VALUES ('Juan Pérez', 'AA123BB', 'Ruido al frenar', 'Categoria Inventada')`,
      ),
    ).rejects.toThrow();
  });

  it('rechaza a nivel de base de datos una prioridad fuera de la lista cerrada (RF-07)', async () => {
    await expect(
      dataSource.query(
        `INSERT INTO ordenes (cliente, patente, descripcion, prioridad)
         VALUES ('Juan Pérez', 'AA123BB', 'Ruido al frenar', 'Urgentísima')`,
      ),
    ).rejects.toThrow();
  });
});
