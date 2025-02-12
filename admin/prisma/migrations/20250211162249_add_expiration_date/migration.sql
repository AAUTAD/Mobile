-- AlterTable
ALTER TABLE "CardAccesses" ADD COLUMN     "expirationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Member" ADD COLUMN     "nextPayment" TIMESTAMP(3);
