UPDATE "users" AS u
SET "is_available_for_mentoring" = true
WHERE u."is_active" = true
  AND EXISTS (
    SELECT 1
    FROM "user_roles" ur
    INNER JOIN "roles" r ON r."id" = ur."role_id"
    WHERE ur."user_id" = u."id"
      AND ur."deleted_at" IS NULL
      AND ur."start_at" <= NOW()
      AND r."name" = 'mentor'
  );
