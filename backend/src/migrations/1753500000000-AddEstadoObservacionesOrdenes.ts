import { MigrationInterface, QueryRunner } from 'typeorm';

// RF-18: fecha/hora del cambio de estado, separada de "updated_at" (que
// también se toca al editar categoría/prioridad). RF-19: observaciones,
// campo único que se pisa en cada edición (no un historial acumulable).
export class AddEstadoObservacionesOrdenes1753500000000 implements MigrationInterface {
  name = 'AddEstadoObservacionesOrdenes1753500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "ordenes"
      ADD COLUMN "estado_actualizado_en" timestamptz NOT NULL DEFAULT now()
    `);
    await queryRunner.query(`
      ALTER TABLE "ordenes"
      ADD COLUMN "observaciones" text NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "ordenes" DROP COLUMN "observaciones"`);
    await queryRunner.query(`ALTER TABLE "ordenes" DROP COLUMN "estado_actualizado_en"`);
  }
}
