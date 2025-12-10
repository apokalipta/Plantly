/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `PlantSpecies` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[username]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,achievementId]` on the table `UserAchievement` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "PlantSpecies" ADD COLUMN     "code" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "username" TEXT;

-- AlterTable
ALTER TABLE "UserSettings" ADD COLUMN     "avatarUrl" TEXT;

-- CreateIndex
CREATE INDEX "Alert_deviceId_resolvedAt_idx" ON "Alert"("deviceId", "resolvedAt");

-- CreateIndex
CREATE INDEX "Alert_deviceId_type_resolvedAt_idx" ON "Alert"("deviceId", "type", "resolvedAt");

-- CreateIndex
CREATE INDEX "Device_ownerId_idx" ON "Device"("ownerId");

-- CreateIndex
CREATE INDEX "PlantInstance_deviceId_status_idx" ON "PlantInstance"("deviceId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "PlantSpecies_code_key" ON "PlantSpecies"("code");

-- CreateIndex
CREATE INDEX "SensorReading_deviceId_timestamp_idx" ON "SensorReading"("deviceId", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "UserAchievement_userId_achievementId_key" ON "UserAchievement"("userId", "achievementId");
