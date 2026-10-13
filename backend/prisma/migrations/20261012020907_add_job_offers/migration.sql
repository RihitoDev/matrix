-- CreateTable
CREATE TABLE "job_offer_skills" (
    "id" UUID NOT NULL,
    "job_offer_id" UUID NOT NULL,
    "skill_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "job_offer_skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_offers" (
    "id" UUID NOT NULL,
    "title" VARCHAR(60) NOT NULL,
    "description" TEXT NOT NULL,
    "company_id" UUID NOT NULL,
    "modality_id" UUID NOT NULL,
    "contract_type_id" UUID NOT NULL,
    "status_id" UUID NOT NULL,
    "category" TEXT NOT NULL,
    "positions_available" INTEGER NOT NULL DEFAULT 1,
    "salary_range" TEXT NOT NULL,
    "languages" TEXT NOT NULL,
    "location_url" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "job_offers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_offer_modalities" (
    "id" UUID NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "job_offer_modalities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_offer_contract_types" (
    "id" UUID NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "job_offer_contract_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_offer_statuses" (
    "id" UUID NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "job_offer_statuses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "job_offer_skills_skill_id_idx" ON "job_offer_skills"("skill_id");

-- CreateIndex
CREATE UNIQUE INDEX "job_offer_skills_job_offer_id_skill_id_key" ON "job_offer_skills"("job_offer_id", "skill_id");

-- CreateIndex
CREATE INDEX "job_offers_company_id_idx" ON "job_offers"("company_id");

-- CreateIndex
CREATE INDEX "job_offers_modality_id_idx" ON "job_offers"("modality_id");

-- CreateIndex
CREATE INDEX "job_offers_contract_type_id_idx" ON "job_offers"("contract_type_id");

-- CreateIndex
CREATE INDEX "job_offers_status_id_idx" ON "job_offers"("status_id");

-- CreateIndex
CREATE UNIQUE INDEX "job_offer_modalities_title_key" ON "job_offer_modalities"("title");

-- CreateIndex
CREATE UNIQUE INDEX "job_offer_contract_types_title_key" ON "job_offer_contract_types"("title");

-- CreateIndex
CREATE UNIQUE INDEX "job_offer_statuses_title_key" ON "job_offer_statuses"("title");

-- AddForeignKey
ALTER TABLE "job_offer_skills" ADD CONSTRAINT "job_offer_skills_job_offer_id_fkey" FOREIGN KEY ("job_offer_id") REFERENCES "job_offers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_offer_skills" ADD CONSTRAINT "job_offer_skills_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "skills"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_offers" ADD CONSTRAINT "job_offers_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_offers" ADD CONSTRAINT "job_offers_modality_id_fkey" FOREIGN KEY ("modality_id") REFERENCES "job_offer_modalities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_offers" ADD CONSTRAINT "job_offers_contract_type_id_fkey" FOREIGN KEY ("contract_type_id") REFERENCES "job_offer_contract_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_offers" ADD CONSTRAINT "job_offers_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "job_offer_statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
