
CREATE TABLE "user_cv_file" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "cv_file_name" VARCHAR,
    "cv_uploaded_at" TIMESTAMPTZ(6),
    "cv_pdf_data" TEXT,

    CONSTRAINT "user_cv_file_pkey" PRIMARY KEY ("id")
);


CREATE UNIQUE INDEX "user_cv_file_user_id_key" ON "user_cv_file"("user_id");


ALTER TABLE "user_cv_file" ADD CONSTRAINT "user_cv_file_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "user_cv_file" ("user_id", "cv_file_name", "cv_uploaded_at", "cv_pdf_data")
SELECT "id", 'CV.pdf', "updated_at", replace(encode("cv_pdf_url", 'base64'), E'\n', '')
FROM "users"
WHERE "cv_pdf_url" IS NOT NULL;

ALTER TABLE "users" DROP COLUMN "cv_pdf_url";
