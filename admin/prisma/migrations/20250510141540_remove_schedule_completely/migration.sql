/*
  Warnings:

  - You are about to drop the column `scheduleId` on the `Sport` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Sport" DROP CONSTRAINT "Sport_scheduleId_fkey";

-- AlterTable
ALTER TABLE "Sport" DROP COLUMN "scheduleId";
