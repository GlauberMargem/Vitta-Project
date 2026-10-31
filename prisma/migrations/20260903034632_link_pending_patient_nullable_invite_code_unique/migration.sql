-- AlterTable
ALTER TABLE "patient_doctor_links" ALTER COLUMN "patient_id" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "patient_doctor_links_invite_code_key" ON "patient_doctor_links"("invite_code");
