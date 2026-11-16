/*
  Warnings:

  - A unique constraint covering the columns `[stripePaymentIntentId]` on the table `Transaction` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "currency" TEXT DEFAULT 'inr',
ADD COLUMN     "stripePaymentIntentId" TEXT,
ADD COLUMN     "stripeStatus" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_stripePaymentIntentId_key" ON "Transaction"("stripePaymentIntentId");
