-- CreateEnum
CREATE TYPE "role" AS ENUM ('PATIENT', 'DOCTOR');

-- CreateEnum
CREATE TYPE "diabetes_type" AS ENUM ('TIPO_1', 'TIPO_2', 'GESTACIONAL', 'OUTRO');

-- CreateEnum
CREATE TYPE "glucose_context" AS ENUM ('JEJUM', 'POS_PRANDIAL', 'ANTES_DE_DORMIR', 'OUTRO');

-- CreateEnum
CREATE TYPE "link_status" AS ENUM ('PENDING', 'ACTIVE', 'REVOKED');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT,
    "role" "role" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_profiles" (
    "user_id" UUID NOT NULL,
    "birth_date" DATE NOT NULL,
    "diabetes_type" "diabetes_type" NOT NULL,

    CONSTRAINT "patient_profiles_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "doctor_profiles" (
    "user_id" UUID NOT NULL,
    "crm" TEXT NOT NULL,
    "specialty" TEXT NOT NULL,

    CONSTRAINT "doctor_profiles_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "glucose_records" (
    "id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "value_mgdl" INTEGER NOT NULL,
    "context" "glucose_context" NOT NULL,
    "measured_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "glucose_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meals" (
    "id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "name" TEXT,
    "carbs_g" INTEGER NOT NULL,
    "eaten_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_doctor_links" (
    "id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "doctor_id" UUID NOT NULL,
    "invite_code" TEXT NOT NULL,
    "status" "link_status" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "patient_doctor_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clinical_notes" (
    "id" UUID NOT NULL,
    "link_id" UUID NOT NULL,
    "doctor_id" UUID NOT NULL,
    "note" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clinical_notes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "glucose_records_patient_id_measured_at_idx" ON "glucose_records"("patient_id", "measured_at");

-- CreateIndex
CREATE INDEX "meals_patient_id_eaten_at_idx" ON "meals"("patient_id", "eaten_at");

-- CreateIndex
CREATE INDEX "patient_doctor_links_doctor_id_status_idx" ON "patient_doctor_links"("doctor_id", "status");

-- CreateIndex
CREATE INDEX "patient_doctor_links_patient_id_status_idx" ON "patient_doctor_links"("patient_id", "status");

-- AddForeignKey
ALTER TABLE "patient_profiles" ADD CONSTRAINT "patient_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctor_profiles" ADD CONSTRAINT "doctor_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "glucose_records" ADD CONSTRAINT "glucose_records_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meals" ADD CONSTRAINT "meals_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_doctor_links" ADD CONSTRAINT "patient_doctor_links_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_doctor_links" ADD CONSTRAINT "patient_doctor_links_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctor_profiles"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinical_notes" ADD CONSTRAINT "clinical_notes_link_id_fkey" FOREIGN KEY ("link_id") REFERENCES "patient_doctor_links"("id") ON DELETE CASCADE ON UPDATE CASCADE;
