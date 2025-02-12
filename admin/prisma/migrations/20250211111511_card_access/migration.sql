-- CreateTable
CREATE TABLE "CardAccesses" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "verificationToken" TEXT NOT NULL,
    "expired" BOOLEAN NOT NULL,

    CONSTRAINT "CardAccesses_pkey" PRIMARY KEY ("id")
);
