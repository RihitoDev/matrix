BEGIN;

-- Conserva los valores y las relaciones al renombrar las columnas físicas.
ALTER TABLE "appointments" RENAME COLUMN "cancelled_by" TO "cancelled_by_id";
ALTER TABLE "appointments" RENAME CONSTRAINT "appointments_cancelled_by_fkey"
    TO "appointments_cancelled_by_id_fkey";

ALTER TABLE "events" RENAME COLUMN "moderated_by" TO "moderated_by_id";
ALTER TABLE "events" RENAME CONSTRAINT "events_moderated_by_fkey"
    TO "events_moderated_by_id_fkey";

ALTER TABLE "events" RENAME COLUMN "created_by" TO "created_by_id";
ALTER TABLE "events" RENAME CONSTRAINT "events_created_by_fkey"
    TO "events_created_by_id_fkey";

ALTER TABLE "event_attendances" RENAME COLUMN "checked_in_by" TO "checked_in_by_id";
ALTER TABLE "event_attendances" RENAME CONSTRAINT "event_attendances_checked_in_by_fkey"
    TO "event_attendances_checked_in_by_id_fkey";

COMMIT;
