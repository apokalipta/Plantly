/*
  Warnings:

  - You are about to alter the column `minLight` on the `PlantCare` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `maxLight` on the `PlantCare` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.

*/
-- AlterTable
ALTER TABLE "PlantCare" ALTER COLUMN "minLight" SET DATA TYPE INTEGER,
ALTER COLUMN "maxLight" SET DATA TYPE INTEGER;
