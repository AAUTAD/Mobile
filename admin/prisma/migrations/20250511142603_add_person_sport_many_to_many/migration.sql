/*
  Warnings:

  - You are about to drop the `PersonSport` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PersonSport" DROP CONSTRAINT "PersonSport_personId_fkey";

-- DropForeignKey
ALTER TABLE "PersonSport" DROP CONSTRAINT "PersonSport_sportId_fkey";

-- DropTable
DROP TABLE "PersonSport";

-- CreateTable
CREATE TABLE "_PersonToSport" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_PersonToSport_AB_unique" ON "_PersonToSport"("A", "B");

-- CreateIndex
CREATE INDEX "_PersonToSport_B_index" ON "_PersonToSport"("B");

-- AddForeignKey
ALTER TABLE "_PersonToSport" ADD CONSTRAINT "_PersonToSport_A_fkey" FOREIGN KEY ("A") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PersonToSport" ADD CONSTRAINT "_PersonToSport_B_fkey" FOREIGN KEY ("B") REFERENCES "Sport"("id") ON DELETE CASCADE ON UPDATE CASCADE;
