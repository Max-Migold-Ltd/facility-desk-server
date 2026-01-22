-- AlterTable
ALTER TABLE "maintenances" ADD COLUMN     "zoneId" TEXT;

-- AddForeignKey
ALTER TABLE "maintenances" ADD CONSTRAINT "maintenances_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "zones"("id") ON DELETE CASCADE ON UPDATE CASCADE;
