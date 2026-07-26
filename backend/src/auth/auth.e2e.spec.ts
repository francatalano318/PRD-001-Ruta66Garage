import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../app.module';

// Test de integración: requiere el Postgres de docker-compose corriendo, la
// migración aplicada y el usuario sembrado (admin@ruta66garage.com /
// Ruta66Garage#2026, ver migrations/1753300000000-CreateUsuariosTable.ts).
describe('POST /auth/login (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('permite el acceso con credenciales válidas (RF-01 / AC-01)', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@ruta66garage.com', password: 'Ruta66Garage#2026' })
      .expect(200);

    expect(typeof response.body.accessToken).toBe('string');
    expect(response.body.accessToken.length).toBeGreaterThan(0);
  });

  it('rechaza una contraseña incorrecta', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@ruta66garage.com', password: 'contraseña-incorrecta' })
      .expect(401);
  });

  it('rechaza un email que no existe', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'no-existe@ruta66garage.com', password: 'lo que sea' })
      .expect(401);
  });

  it('rechaza un email con formato inválido', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'no-es-un-email', password: 'Ruta66Garage#2026' })
      .expect(400);
  });
});
