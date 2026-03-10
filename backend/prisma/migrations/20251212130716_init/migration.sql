-- CreateEnum
CREATE TYPE "PotFormat" AS ENUM ('SMALL', 'MEDIUM', 'LARGE');

-- AlterTable
ALTER TABLE "Alert" ADD COLUMN     "baseSlotId" TEXT;

-- AlterTable
ALTER TABLE "SensorReading" ADD COLUMN     "baseSlotId" TEXT;

-- CreateTable
CREATE TABLE "BaseDevice" (
    "id" TEXT NOT NULL,
    "baseUid" TEXT NOT NULL,
    "pairingCode" TEXT,
    "name" TEXT,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BaseDevice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BaseSlot" (
    "id" TEXT NOT NULL,
    "baseId" TEXT NOT NULL,
    "slotIndex" INTEGER NOT NULL,
    "potFormat" "PotFormat" NOT NULL DEFAULT 'SMALL',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "currentPlantInstanceId" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BaseSlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SlotAssignmentHistory" (
    "id" TEXT NOT NULL,
    "baseSlotId" TEXT NOT NULL,
    "plantInstanceId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unassignedAt" TIMESTAMP(3),

    CONSTRAINT "SlotAssignmentHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BaseDevice_baseUid_key" ON "BaseDevice"("baseUid");

-- CreateIndex
CREATE UNIQUE INDEX "BaseDevice_pairingCode_key" ON "BaseDevice"("pairingCode");

-- CreateIndex
CREATE INDEX "BaseDevice_ownerId_idx" ON "BaseDevice"("ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "BaseSlot_currentPlantInstanceId_key" ON "BaseSlot"("currentPlantInstanceId");

-- CreateIndex
CREATE UNIQUE INDEX "BaseSlot_baseId_slotIndex_key" ON "BaseSlot"("baseId", "slotIndex");

-- CreateIndex
CREATE INDEX "SlotAssignmentHistory_baseSlotId_assignedAt_idx" ON "SlotAssignmentHistory"("baseSlotId", "assignedAt");

-- CreateIndex
CREATE INDEX "SlotAssignmentHistory_plantInstanceId_assignedAt_idx" ON "SlotAssignmentHistory"("plantInstanceId", "assignedAt");

-- CreateIndex
CREATE INDEX "Alert_baseSlotId_resolvedAt_idx" ON "Alert"("baseSlotId", "resolvedAt");

-- CreateIndex
CREATE INDEX "SensorReading_baseSlotId_timestamp_idx" ON "SensorReading"("baseSlotId", "timestamp");

-- AddForeignKey
ALTER TABLE "SensorReading" ADD CONSTRAINT "SensorReading_baseSlotId_fkey" FOREIGN KEY ("baseSlotId") REFERENCES "BaseSlot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_baseSlotId_fkey" FOREIGN KEY ("baseSlotId") REFERENCES "BaseSlot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BaseDevice" ADD CONSTRAINT "BaseDevice_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BaseSlot" ADD CONSTRAINT "BaseSlot_baseId_fkey" FOREIGN KEY ("baseId") REFERENCES "BaseDevice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BaseSlot" ADD CONSTRAINT "BaseSlot_currentPlantInstanceId_fkey" FOREIGN KEY ("currentPlantInstanceId") REFERENCES "PlantInstance"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SlotAssignmentHistory" ADD CONSTRAINT "SlotAssignmentHistory_baseSlotId_fkey" FOREIGN KEY ("baseSlotId") REFERENCES "BaseSlot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SlotAssignmentHistory" ADD CONSTRAINT "SlotAssignmentHistory_plantInstanceId_fkey" FOREIGN KEY ("plantInstanceId") REFERENCES "PlantInstance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
