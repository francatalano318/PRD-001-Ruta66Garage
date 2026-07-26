import 'dotenv/config';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Orden } from './ordenes/entities/orden.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USER ?? 'ruta66',
  password: process.env.DB_PASSWORD ?? 'ruta66',
  database: process.env.DB_NAME ?? 'ruta66garage',
  entities: [Orden],
  migrations: [__dirname + '/migrations/*.ts'],
  synchronize: false,
});
