-- AlterTable
ALTER TABLE "patient_profiles"
  ADD COLUMN "hypo_threshold" INTEGER NOT NULL DEFAULT 70,
  ADD COLUMN "severe_hypo_threshold" INTEGER NOT NULL DEFAULT 54,
  ADD COLUMN "hyper_fasting_threshold" INTEGER NOT NULL DEFAULT 130,
  ADD COLUMN "hyper_postprandial_threshold" INTEGER NOT NULL DEFAULT 180;
