-- AlterTable
ALTER TABLE "PurchaseOrder" ADD COLUMN     "checkoutTransactionId" TEXT;

-- CreateIndex
CREATE INDEX "PurchaseOrder_checkoutTransactionId_idx" ON "PurchaseOrder"("checkoutTransactionId");

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_checkoutTransactionId_fkey" FOREIGN KEY ("checkoutTransactionId") REFERENCES "Transaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;
