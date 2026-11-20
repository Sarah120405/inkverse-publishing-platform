import { Prisma } from "@prisma/client";
import prisma from "../../../config/db.config.js";
import { createAuditLog } from "../../../utils/auditLog.js";
import creditWallets from "./walletCredit.service.js";

const fulfillSuccessfulPayment = async (paymentIntent) => {
  // 1. Verify successful payment and metadata.
  if (paymentIntent?.status !== "succeeded") {
    throw new Error("Payment has not succeeded");
  }

  const { transactionId, userId } = paymentIntent.metadata ?? {};

  if (!transactionId || !userId) {
    throw new Error("Invalid payment metadata");
  }

  // 2. Retrieve the Inkverse transaction and its orders.
  const payment = await prisma.transaction.findUnique({
    where: { transactionId },
    include: {
      checkoutOrders: {
        include: {
          orderBook: true,
        },
      },
    },
  });

  if (!payment) {
    throw new Error("Transaction not found");
  }

  // 3. Verify payment ownership and association.
  if (
    payment.userId !== userId ||
    payment.stripePaymentIntentId !== paymentIntent.id ||
    payment.paymentMethod !== "Stripe" ||
    payment.currency?.toLowerCase() !== "inr"
  ) {
    throw new Error("Payment verification failed");
  }

  // 4. Handle an already fulfilled payment.
  if (payment.paymentStatus === "Paid") {
    return {
      alreadyProcessed: true,
      transactionId: payment.transactionId,
    };
  }

  if (payment.paymentStatus !== "Pending") {
    throw new Error("Payment is not pending");
  }

  const orders = payment.checkoutOrders;

  if (!orders || orders.length === 0) {
    throw new Error("No purchase orders found");
  }

  // 5. Validate stored order details and calculate expected amount.
  let expectedAmount = new Prisma.Decimal(0);

  for (const order of orders) {
    if (
      order.userId !== userId ||
      order.paymentStatus !== "Pending" ||
      !order.orderBook ||
      !Number.isSafeInteger(order.quantity) ||
      order.quantity <= 0 ||
      order.totalPrice.lessThanOrEqualTo(0)
    ) {
      throw new Error("Invalid purchase order");
    }

    expectedAmount = expectedAmount.plus(order.totalPrice);
  }

  // 6. Verify the actual Stripe payment amount.
  const expectedPaise = expectedAmount.mul(100);

  if (
    !expectedPaise.isInteger() ||
    !Number.isSafeInteger(expectedPaise.toNumber()) ||
    paymentIntent.currency !== "inr" ||
    paymentIntent.amount !== expectedPaise.toNumber() ||
    paymentIntent.amount_received !== expectedPaise.toNumber() ||
    payment.currency?.toLowerCase() !== "inr" ||
    !payment.amount.equals(expectedAmount)
  ) {
    throw new Error("Payment amount validation failed");
  }

  // 7. Perform all fulfilment operations atomically.
  const result = await prisma.$transaction(async (tx) => {
    // Conditional update prevents duplicate fulfilment.
    const updatedPayment = await tx.transaction.updateMany({
      where: {
        id: payment.id,
        paymentStatus: "Pending",
        stripePaymentIntentId: paymentIntent.id,
      },
      data: {
        paymentStatus: "Paid",
        stripeStatus: paymentIntent.status,
      },
    });

    if (updatedPayment.count !== 1) {
      return { alreadyProcessed: true };
    }

    // Mark all associated purchase orders as Paid.
    const updatedOrders = await tx.purchaseOrder.updateMany({
      where: {
        checkoutTransactionId: payment.id,
        userId,
        paymentStatus: "Pending",
      },
      data: {
        paymentStatus: "Paid",
      },
    });

    if (updatedOrders.count !== orders.length) {
      throw new Error("Failed to update all purchase orders");
    }

    // Create purchase-order audit logs.
    for (const order of orders) {
      await createAuditLog(tx, {
        userId,
        action: "ONLINE_ORDER_CREATED",
        entityType: "PurchaseOrder",
        entityId: order.id,
        oldValue: {
          paymentStatus: "Pending",
        },
        newValue: {
          bookId: order.bookId,
          quantity: order.quantity,
          totalPrice: order.totalPrice.toString(),
          paymentStatus: "Paid",
        },
      });
    }

    // Credit author and admin wallets.
    const walletResult = await creditWallets(tx, {
      orders,
      userId,
      payment,
    });

    // Remove purchased books from the cart.
    await tx.cart.deleteMany({
      where: {
        userId,
        bookId: {
          in: orders.map((order) => order.bookId),
        },
      },
    });

    return {
      alreadyProcessed: false,
      transactionId: payment.transactionId,
      purchaseOrders: orders.map((order) => ({
        ...order,
        paymentStatus: "Paid",
      })),
      totalAmount: expectedAmount.toString(),
      totalCommission: walletResult.totalCommission.toString(),
      authorEarnings: Object.fromEntries(
        [...walletResult.authorEarnings].map(([authorId, amount]) => [
          authorId,
          amount.toString(),
        ]),
      ),
    };
  });

  return result;
};

export default fulfillSuccessfulPayment;
