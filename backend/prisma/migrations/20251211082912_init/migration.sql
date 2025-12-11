/*
  Warnings:

  - You are about to drop the `UserAchievementProgress` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserAchievementProgress" DROP CONSTRAINT "UserAchievementProgress_userId_fkey";

-- DropTable
DROP TABLE "UserAchievementProgress";
