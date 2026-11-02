/*
  Warnings:

  - You are about to alter the column `price` on the `Book` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(12,2)`.
  - You are about to alter the column `amount` on the `PayoutRequest` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(12,2)`.
  - You are about to alter the column `quotationAmount` on the `PrintingOrder` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(12,2)`.
  - You are about to alter the column `advanceAmount` on the `PrintingOrder` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(12,2)`.
  - You are about to alter the column `remainingAmount` on the `PrintingOrder` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(12,2)`.
  - You are about to alter the column `totalPrice` on the `PurchaseOrder` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(12,2)`.
  - You are about to alter the column `amount` on the `Transaction` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(12,2)`.
  - You are about to alter the column `perPageCost` on the `VendorProfile` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(12,2)`.
  - You are about to alter the column `totalBalance` on the `Wallet` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(12,2)`.
  - You are about to alter the column `totalWithdrawn` on the `Wallet` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(12,2)`.
  - You are about to alter the column `currentBalance` on the `Wallet` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(12,2)`.

*/
-- AlterTable
ALTER TABLE "Book" ALTER COLUMN "price" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "PayoutRequest" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "PrintingOrder" ALTER COLUMN "quotationAmount" SET DATA TYPE DECIMAL(12,2),
ALTER COLUMN "advanceAmount" SET DATA TYPE DECIMAL(12,2),
ALTER COLUMN "remainingAmount" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "PurchaseOrder" ALTER COLUMN "totalPrice" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "Transaction" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "VendorProfile" ALTER COLUMN "perPageCost" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "Wallet" ALTER COLUMN "totalBalance" SET DATA TYPE DECIMAL(12,2),
ALTER COLUMN "totalWithdrawn" SET DATA TYPE DECIMAL(12,2),
ALTER COLUMN "currentBalance" SET DATA TYPE DECIMAL(12,2);
