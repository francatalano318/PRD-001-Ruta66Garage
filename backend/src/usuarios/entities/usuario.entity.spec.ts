import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Usuario } from './usuario.entity';
import { CreateUsuariosTable1753300000000 } from '../../migrations/1753300000000-CreateUsuariosTable';

// Test de integración: requiere el Postgres de docker-compose corriendo
// (ver docker-compose.yml en la raíz). Verifica que el usuario sembrado
// por la migración exista y que su contraseña sea la esperada (RF-01).
describe('Usuario (modelo de datos + seed)', () => {
  let dataSource: DataSource;

  beforeAll(async () => {
    dataSource = new DataSource({
      type: 'postgres',
      host: process.env.DB_HOST ?? 'localhost',
      port: Number(process.env.DB_PORT ?? 5432),
      username: process.env.DB_USER ?? 'ruta66',
      password: process.env.DB_PASSWORD ?? 'ruta66',
      database: process.env.DB_NAME ?? 'ruta66garage',
      entities: [Usuario],
      migrations: [CreateUsuariosTable1753300000000],
    });
    await dataSource.initialize();
    await dataSource.runMigrations();
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it('siembra un usuario con el email esperado', async () => {
    const usuario = await dataSource
      .getRepository(Usuario)
      .findOneBy({ email: 'admin@ruta66garage.com' });

    expect(usuario).not.toBeNull();
  });

  it('la contraseña sembrada es la documentada para el equipo', async () => {
    const usuario = await dataSource
      .getRepository(Usuario)
      .findOneBy({ email: 'admin@ruta66garage.com' });

    const coincide = await bcrypt.compare('Ruta66Garage#2026', usuario!.passwordHash);
    expect(coincide).toBe(true);
  });

  it('el email es único', async () => {
    const repo = dataSource.getRepository(Usuario);
    await expect(
      repo.save(repo.create({ email: 'admin@ruta66garage.com', passwordHash: 'x' })),
    ).rejects.toThrow();
  });
});
