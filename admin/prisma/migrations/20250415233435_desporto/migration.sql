/*
  Warnings:

  - You are about to drop the `desporto` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "desporto";

-- CreateTable
CREATE TABLE "Desporto" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT,
    "type" TEXT NOT NULL,

    CONSTRAINT "Desporto_pkey" PRIMARY KEY ("id")
);
