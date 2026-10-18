ALTER TABLE "access_requests" ADD COLUMN IF NOT EXISTS "opened_by_id" UUID;
ALTER TABLE "access_requests" ADD COLUMN IF NOT EXISTS "opened_at" TIMESTAMPTZ(6);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'access_requests_opened_by_id_fkey'
          AND conrelid = 'access_requests'::regclass
    ) THEN
        ALTER TABLE "access_requests"
            ADD CONSTRAINT "access_requests_opened_by_id_fkey"
            FOREIGN KEY ("opened_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

UPDATE "access_requests" AS ar
SET "opened_by_id" = ar."reviewed_by_id",
    "opened_at" = ar."reviewed_at"
FROM "access_request_statuses" AS st
WHERE ar."status_id" = st."id"
  AND st."title" = 'in_review'
  AND ar."opened_at" IS NULL;
