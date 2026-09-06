-- AlterTable
ALTER TABLE "glucose_records" ADD COLUMN     "linked_meal_id" UUID;

-- AddForeignKey
ALTER TABLE "glucose_records" ADD CONSTRAINT "glucose_records_linked_meal_id_fkey" FOREIGN KEY ("linked_meal_id") REFERENCES "meals"("id") ON DELETE SET NULL ON UPDATE CASCADE;
