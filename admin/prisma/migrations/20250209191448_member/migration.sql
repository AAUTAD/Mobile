-- CreateTable
CREATE TABLE "Member" (
    "id" SERIAL NOT NULL,
    "memberId" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "registrationDate" TIMESTAMP(3) NOT NULL,
    "course" TEXT NOT NULL,
    "studentNumber" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "cardStatus" TEXT NOT NULL,
    "paymentStatus" TEXT NOT NULL,
    "locality" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "citizenCard" TEXT NOT NULL,
    "nif" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Member_memberId_key" ON "Member"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "Member_email_key" ON "Member"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Member_citizenCard_key" ON "Member"("citizenCard");

-- CreateIndex
CREATE UNIQUE INDEX "Member_nif_key" ON "Member"("nif");
