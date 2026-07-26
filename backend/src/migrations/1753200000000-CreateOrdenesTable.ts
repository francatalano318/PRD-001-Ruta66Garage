import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOrdenesTable1753200000000 implements MigrationInterface {
  name = 'CreateOrdenesTable1753200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "categoria_orden" AS ENUM (
        'Motor', 'Frenos', 'Suspensión', 'Dirección', 'Electricidad',
        'Transmisión', 'Otro', 'Sin clasificar'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "prioridad_orden" AS ENUM (
        'Alta', 'Media', 'Baja', 'Sin asignar'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "estado_orden" AS ENUM (
        'Abierta', 'En diagnóstico', 'Reparando', 'Finalizada'
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "ordenes" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "cliente" varchar NOT NULL,
        "patente" varchar NOT NULL,
        "descripcion" text NOT NULL,
        "categoria" "categoria_orden" NOT NULL DEFAULT 'Sin clasificar',
        "prioridad" "prioridad_orden" NOT NULL DEFAULT 'Sin asignar',
        "estado" "estado_orden" NOT NULL DEFAULT 'Abierta',
        "categoria_asignada_por_ia" boolean NOT NULL DEFAULT false,
        "prioridad_asignada_por_ia" boolean NOT NULL DEFAULT false,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_ordenes_id" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "ordenes"`);
    await queryRunner.query(`DROP TYPE "estado_orden"`);
    await queryRunner.query(`DROP TYPE "prioridad_orden"`);
    await queryRunner.query(`DROP TYPE "categoria_orden"`);
  }
}
