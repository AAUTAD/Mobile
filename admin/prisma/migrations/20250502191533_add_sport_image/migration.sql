/*
  Warnings:

  - You are about to drop the `Desporto` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Sport" ADD COLUMN     "imageUrl" TEXT;

-- DropTable
DROP TABLE "Desporto";
