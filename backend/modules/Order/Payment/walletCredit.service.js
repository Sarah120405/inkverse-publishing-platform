import { Prisma } from "@prisma/client";
import { createAuditLog } from "../../../utils/auditLog.js";

const creditWallets = async (tx, { orders, userId, payment }) => {
  // 1. Find the platform admin.
  const admin = await tx.user.findFirst({
    where: { role: "Admin" },
    select: { id: true },
  });

  if (!admin) {
    throw new Error("Admin account not found");
  }

  // 2. Retrieve the platform commission rate.
  const commissionSetting = await tx.setting.findUnique({
    where: { key: "commission_rate" },
  });

  const commissionRate = new Prisma.Decimal(
    commissionSetting ? commissionSetting.value : "0.1",
  );

  if (commissionRate.lessThan(0) || commissionRate.greaterThan(1)) {
    throw new Error("Invalid commission rate");
  }

  // 3. Calculate earnings for each author.
  const authorEarnings = new Map();
  let totalCommission = new Prisma.Decimal(0);

  for (const order of orders) {
    const authorId = order.orderBook.authorId;

    const commission = order.totalPrice.mul(commissionRate);
    const authorAmount = order.totalPrice.minus(commission);

    totalCommission = totalCommission.plus(commission);

    const existingAmount =
      authorEarnings.get(authorId) || new Prisma.Decimal(0);

    authorEarnings.set(authorId, existingAmount.plus(authorAmount));
  }

  // 4. Credit each author's wallet.
  for (const [authorId, authorAmount] of authorEarnings) {
    const authorWallet = await tx.wallet.findUnique({
      where: { userId: authorId },
    });

    if (!authorWallet) {
      throw new Error(`Wallet not found for author ${authorId}`);
    }

    const updatedWallet = await tx.wallet.update({
      where: { userId: authorId },
      data: {
        totalBalance: { increment: authorAmount },
        currentBalance: { increment: authorAmount },
      },
    });

    await createAuditLog(tx, {
      userId: authorId,
      action: "AUTHOR_WALLET_CREDITED",
      entityType: "Wallet",
      entityId: authorWallet.id,
      oldValue: {
        totalBalance: authorWallet.totalBalance.toString(),
        currentBalance: authorWallet.currentBalance.toString(),
      },
      newValue: {
        totalBalance: updatedWallet.totalBalance.toString(),
        currentBalance: updatedWallet.currentBalance.toString(),
        amount: authorAmount.toString(),
        sourceTransactionId: payment.transactionId,
      },
    });
  }

  // 5. Credit the admin wallet with the total commission.
  const adminWallet = await tx.wallet.findUnique({
    where: { userId: admin.id },
  });

  if (!adminWallet) {
    throw new Error("Admin wallet not found");
  }

  const updatedAdminWallet = await tx.wallet.update({
    where: { userId: admin.id },
    data: {
      totalBalance: { increment: totalCommission },
      currentBalance: { increment: totalCommission },
    },
  });

  await createAuditLog(tx, {
    userId: admin.id,
    action: "ADMIN_COMMISSION_CREDITED",
    entityType: "Wallet",
    entityId: adminWallet.id,
    oldValue: {
      totalBalance: adminWallet.totalBalance.toString(),
      currentBalance: adminWallet.currentBalance.toString(),
    },
    newValue: {
      totalBalance: updatedAdminWallet.totalBalance.toString(),
      currentBalance: updatedAdminWallet.currentBalance.toString(),
      amount: totalCommission.toString(),
      sourceTransactionId: payment.transactionId,
    },
  });

  return {
    totalCommission,
    authorEarnings,
  };
};

export default creditWallets;
