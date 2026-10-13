-- CreateTable
CREATE TABLE "admin_export_histories" (
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "report_name" VARCHAR(255) NOT NULL,
    "report_type" VARCHAR(100) NOT NULL,

    CONSTRAINT "admin_export_histories_pkey" PRIMARY KEY ("user_id","created_at")
);

-- AddForeignKey
ALTER TABLE "admin_export_histories" ADD CONSTRAINT "admin_export_histories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
