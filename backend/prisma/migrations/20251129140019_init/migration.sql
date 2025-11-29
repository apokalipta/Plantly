/*
  Warnings:

  - A unique constraint covering the columns `[pairingCode]` on the table `Device` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[commonName]` on the table `PlantSpecies` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Device" DROP CONSTRAINT "Device_ownerId_fkey";

-- DropIndex
DROP INDEX "PlantSpecies_commonName_idx";

-- AlterTable
ALTER TABLE "Device" ADD COLUMN     "pairedAt" TIMESTAMP(3),
ADD COLUMN     "pairingCode" TEXT,
ALTER COLUMN "ownerId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "tokenVersion" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "Device_pairingCode_key" ON "Device"("pairingCode");

-- CreateIndex
CREATE UNIQUE INDEX "PlantSpecies_commonName_key" ON "PlantSpecies"("commonName");

-- AddForeignKey
ALTER TABLE "Device" ADD CONSTRAINT "Device_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
