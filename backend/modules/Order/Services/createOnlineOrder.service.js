import { Prisma } from "@prisma/client";
import prisma from "../../../config/db.config.js";
import response from "../../../utils/response.js";
import { createAuditLog } from "../../../utils/auditLog.js";
import stripe from "../../../config/stripe.config.js";
import { randomUUID } from "crypto";
import { getOrCreateStripeCustomer } from "../Payment/stripeCustomer.service.js";

const createOnlineOrder = async (
  items,
  userId,
  savePaymentMethod = false,
  paymentMethodId = null,
) => {
  if (!Array.isArray(items) || items.length === 0) {
    return response(400, false, "At least one book is required");
  }

  const quantities = items.map((item) => Number(item.quantity));

  if (
    quantities.some(
      (quantity) => !Number.isSafeInteger(quantity) || quantity <= 0,
    )
  ) {
    return response(400, false, "Quantity must be a positive integer");
  }

  if (
    items.some(
      ({ book }) => !book || book.price === null || book.price === undefined,
    )
  ) {
    return response(400, false, "Book price is not configured");
  }

  const totalPrice = items.reduce(
    (total, item, index) =>
      total.plus(
        new Prisma.Decimal(item.book.price.toString()).mul(quantities[index]),
      ),
    new Prisma.Decimal(0),
  );

  if (totalPrice.lessThanOrEqualTo(0)) {
    return response(400, false, "Invalid payment amount");
  }

  const amountPaise = totalPrice.mul(100);

  if (
    !amountPaise.isInteger() ||
    !Number.isSafeInteger(amountPaise.toNumber())
  ) {
    return response(400, false, "Invalid payment amount");
  }
  // 1. Create a pending transaction in your database.
  const payment = await prisma.transaction.create({
    data: {
      userId,
      transactionId: `TXN-${randomUUID()}`,
      amount: totalPrice,
      paymentMethod: "Stripe",
      paymentStatus: "Pending",
      currency: "inr",
      checkoutOrders: {
        create: items.map((item, index) => ({
          userId,
          bookId: item.book.id,
          quantity: quantities[index],
          totalPrice: new Prisma.Decimal(item.book.price.toString()).mul(
            quantities[index],
          ),
          paymentStatus: "Pending",
        })),
      },
    },
    include: {
      checkoutOrders: true,
    },
  });

  // 2. Create the Stripe PaymentIntent.
  let paymentIntent;

  try {
    const customer = await getOrCreateStripeCustomer(userId);

    let savedPaymentMethod = null;

    if (paymentMethodId) {
      savedPaymentMethod =
        await stripe.paymentMethods.retrieve(paymentMethodId);
      const paymentMethodCustomerId =
        typeof savedPaymentMethod.customer === "string"
          ? savedPaymentMethod.customer
          : savedPaymentMethod.customer?.id;

      if (
        paymentMethodCustomerId !== customer.id ||
        savedPaymentMethod.type !== "card"
      ) {
        throw new Error("Invalid payment method for this customer");
      }
    }

    paymentIntent = await stripe.paymentIntents.create(
      {
        amount: amountPaise.toNumber(),
        currency: "inr",
        customer: customer.id,
        automatic_payment_methods: { enabled: true },
        ...(savedPaymentMethod
          ? {
              payment_method: savedPaymentMethod.id,
            }
          : {
              setup_future_usage: savePaymentMethod ? "off_session" : undefined,
            }),
        metadata: {
          transactionId: payment.transactionId,
          userId,
        },
      },
      {
        idempotencyKey: `inkverse_order_${payment.transactionId}`,
      },
    );
    if (!paymentIntent.client_secret) {
      throw new Error("Stripe client secret unavailable");
    }
  } catch (error) {
    await prisma.$transaction([
      prisma.transaction.update({
        where: { id: payment.id },
        data: {
          paymentStatus: "Rejected",
          stripeStatus: "creation_failed",
        },
      }),

      prisma.purchaseOrder.updateMany({
        where: {
          checkoutTransactionId: payment.id,
          paymentStatus: "Pending",
        },
        data: {
          paymentStatus: "Rejected",
        },
      }),
    ]);

    throw error;
  }

  // 3. Save the PaymentIntent details and audit log.
  const updatedPayment = await prisma.$transaction(async (tx) => {
    const updated = await tx.transaction.update({
      where: { id: payment.id },
      data: {
        stripePaymentIntentId: paymentIntent.id,
        stripeStatus: paymentIntent.status,
      },
    });

    await createAuditLog(tx, {
      userId,
      action: "PAYMENT_TRANSACTION_CREATED",
      entityType: "Transaction",
      entityId: updated.id,
      oldValue: Prisma.JsonNull,
      newValue: {
        amount: updated.amount.toString(),
        paymentMethod: updated.paymentMethod,
        paymentStatus: updated.paymentStatus,
        stripePaymentIntentId: updated.stripePaymentIntentId,
      },
    });

    return updated;
  });

  return response(
    200,
    true,
    "Payment initiated",
    {
      transaction: updatedPayment,
      clientSecret: paymentIntent.client_secret,
      items: items.map((item, index) => ({
        book: item.book,
        quantity: quantities[index],
      })),
      totalAmount: totalPrice.toString(),
    },
    null,
  );
};

export default createOnlineOrder;
