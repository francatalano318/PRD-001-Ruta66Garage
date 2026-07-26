import { MigrationInterface, QueryRunner } from 'typeorm';

// Soporta los filtros de RF-13/14/15 y el orden por fecha del listado
// (RF-12), en línea con el objetivo de RNF-05 (<2s por página).
export class AddOrdenesIndexes1753400000000 implements MigrationInterface {
  name = 'AddOrdenesIndexes1753400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE INDEX "IDX_ordenes_estado" ON "ordenes" ("estado")`);
    await queryRunner.query(`CREATE INDEX "IDX_ordenes_categoria" ON "ordenes" ("categoria")`);
    await queryRunner.query(`CREATE INDEX "IDX_ordenes_prioridad" ON "ordenes" ("prioridad")`);
    await queryRunner.query(`CREATE INDEX "IDX_ordenes_created_at" ON "ordenes" ("created_at")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_ordenes_created_at"`);
    await queryRunner.query(`DROP INDEX "IDX_ordenes_prioridad"`);
    await queryRunner.query(`DROP INDEX "IDX_ordenes_categoria"`);
    await queryRunner.query(`DROP INDEX "IDX_ordenes_estado"`);
  }
}
