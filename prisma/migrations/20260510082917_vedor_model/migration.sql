/*
  Warnings:

  - You are about to drop the column `status` on the `PrintingOrder` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "DeliveryStatus" AS ENUM ('Pending', 'Printing', 'Shipped', 'Delivered');

-- CreateEnum
CREATE TYPE "PrintRequestStatus" AS ENUM ('Pending', 'Rejected', 'Accepted');

-- AlterTable
ALTER TABLE "PrintingOrder" DROP COLUMN "status",
ADD COLUMN     "deliveryStatus" "DeliveryStatus" NOT NULL DEFAULT 'Pending',
ADD COLUMN     "printStatus" "PrintRequestStatus" NOT NULL DEFAULT 'Pending';

-- DropEnum
DROP TYPE "public"."OrderStatus";

-- DropEnum
DROP TYPE "public"."PrintingStatus";
