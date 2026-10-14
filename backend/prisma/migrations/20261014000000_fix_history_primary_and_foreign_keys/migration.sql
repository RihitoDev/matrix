BEGIN;

-- Conserva los registros existentes y asigna un identificador a cada uno.
ALTER TABLE "admin_export_histories" ADD COLUMN "id" UUID;
UPDATE "admin_export_histories" SET "id" = gen_random_uuid();
ALTER TABLE "admin_export_histories" ALTER COLUMN "id" SET NOT NULL;

-- Mantiene la unicidad de la antigua clave compuesta.
CREATE UNIQUE INDEX "admin_export_histories_user_id_created_at_key"
    ON "admin_export_histories"("user_id", "created_at");
ALTER TABLE "admin_export_histories" DROP CONSTRAINT "admin_export_histories_pkey";
ALTER TABLE "admin_export_histories" ADD CONSTRAINT "admin_export_histories_pkey" PRIMARY KEY ("id");

-- Renombra la columna sin perder sus valores ni modificar la relación.
ALTER TABLE "appointment_histories" RENAME COLUMN "changed_by" TO "changed_by_id";
ALTER TABLE "appointment_histories" RENAME CONSTRAINT "appointment_histories_changed_by_fkey"
    TO "appointment_histories_changed_by_id_fkey";

COMMIT;
