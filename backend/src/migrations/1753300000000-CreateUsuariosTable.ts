import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcryptjs';

// Usuario sembrado para poder loguearse (RF-01). El PRD no pide un
// endpoint de alta de usuarios; si hace falta otro, se inserta a mano.
const EMAIL_SEMILLA = 'admin@ruta66garage.com';
const PASSWORD_SEMILLA = 'Ruta66Garage#2026';

export class CreateUsuariosTable1753300000000 implements MigrationInterface {
  name = 'CreateUsuariosTable1753300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "usuarios" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "email" varchar NOT NULL,
        "password_hash" varchar NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_usuarios_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_usuarios_email" UNIQUE ("email")
      )
    `);

    const hash = await bcrypt.hash(PASSWORD_SEMILLA, 10);
    await queryRunner.query(
      `INSERT INTO "usuarios" (email, password_hash) VALUES ($1, $2)`,
      [EMAIL_SEMILLA, hash],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "usuarios"`);
  }
}
