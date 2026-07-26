import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { Orden } from './ordenes/entities/orden.entity';
import { OrdenesModule } from './ordenes/ordenes.module';
import { Usuario } from './usuarios/entities/usuario.entity';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST ?? 'localhost',
      port: Number(process.env.DB_PORT ?? 5432),
      username: process.env.DB_USER ?? 'ruta66',
      password: process.env.DB_PASSWORD ?? 'ruta66',
      database: process.env.DB_NAME ?? 'ruta66garage',
      entities: [Orden, Usuario],
      synchronize: false,
    }),
    AuthModule,
    OrdenesModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: JwtAuthGuard }],
})
export class AppModule {}
