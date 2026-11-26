import { Prisma } from "@prisma/client";
import prisma from "../../../config/db.config.js";
import response from "../../../utils/response.js";
import { createAuditLog } from "../../../utils/auditLog.js";

import creditWallets from "./walletCredit.service.js";

import {
  claimWebhookEvent,
  markWebhookEventProcessed,
  markWebhookEventFailed,
  markWebhookEventIgnored,
} from "./webhookEvent.service.js";
import fulfillSuccessfulPayment from "./paymentFulfilled.service.js";
import { publishedOrderCompleted } from "../../../events/producer/order.producer.js";

const completeOrder = async (paymentIntent, event) => {
  let eventClaimed = false;

  try {
    // 1. Validate webhook event.
    if (!event?.id || !event?.type) {
      throw new Error("Invalid webhook event information");
    }

    if (event.data?.object?.id !== paymentIntent.id) {
      throw new Error("Webhook PaymentIntent mismatch");
    }
    // 2. Claim the event to prevent concurrent processing.
    const claim = await claimWebhookEvent(event);

    if (!claim.claimed) {
      return response(
        200,
        true,
        "Webhook event already handled",
        {
          status: claim.status,
        },
        null,
      );
    }

    eventClaimed = true;

    if (event.type !== "payment_intent.succeeded") {
      await markWebhookEventIgnored(event.id);

      return response(200, true, "Webhook event ignored", null, null);
    }
    /* 
    // 3. Verify PaymentIntent.
    const { transactionId, userId } = paymentIntent.metadata;

    if (paymentIntent.status !== "succeeded") {
      throw new Error("Payment has not succeeded");
    }

    if (!transactionId || !userId) {
      throw new Error("Invalid payment metadata");
    }

    // 4. Retrieve transaction and purchase orders.
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

    // 5. Verify PaymentIntent ownership.
    if (
      payment.userId !== userId ||
      payment.stripePaymentIntentId !== paymentIntent.id ||
      payment.paymentMethod !== "Stripe"
    ) {
      throw new Error("Payment verification failed");
    }

    // 6. Handle an already completed transaction.
    if (payment.paymentStatus === "Paid") {
      await markWebhookEventProcessed(event.id);

      return response(
        200,
        true,
        "Payment already processed",
        {
          alreadyProcessed: true,
          transactionId: payment.transactionId,
        },
        null,
      );
    }

    if (payment.paymentStatus !== "Pending") {
      throw new Error("Payment is not pending");
    }

    const orders = payment.checkoutOrders;

    if (!orders || orders.length === 0) {
      throw new Error("No purchase orders found");
    }

    // 7. Verify stored purchase-order snapshots and amount.
    let expectedAmount = new Prisma.Decimal(0);

    for (const order of orders) {
      if (
        order.userId !== userId ||
        order.paymentStatus !== "Pending" ||
        !order.orderBook
      ) {
        throw new Error("Invalid purchase order");
      }

      if (
        !Number.isSafeInteger(order.quantity) ||
        order.quantity <= 0 ||
        order.totalPrice.lessThanOrEqualTo(0)
      ) {
        throw new Error("Invalid purchase order details");
      }

      expectedAmount = expectedAmount.plus(order.totalPrice);
    }

    const expectedPaise = expectedAmount.mul(100);

    if (
      !expectedPaise.isInteger() ||
      !Number.isSafeInteger(expectedPaise.toNumber()) ||
      paymentIntent.currency !== "inr" ||
      paymentIntent.amount !== expectedPaise.toNumber() ||
      paymentIntent.amount_received !== expectedPaise.toNumber() ||
      !payment.amount.equals(expectedAmount)
    ) {
      throw new Error("Payment amount validation failed");
    }

    // 8. Perform all fulfilment operations atomically.
    const result = await prisma.$transaction(async (tx) => {
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

      // Mark every purchase order as Paid.
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
    }); */

    const result = await fulfillSuccessfulPayment(paymentIntent);

    // 9. If another request completed the transaction first.
    if (result.alreadyProcessed) {
      await markWebhookEventProcessed(event.id);

      return response(200, true, "Payment already processed", result, null);
    }

    // 10. Mark event processed only after the DB transaction commits.
    await markWebhookEventProcessed(event.id);

    publishedOrderCompleted(result);

    return response(201, true, "Order successful", result, null);
  } catch (error) {
    // Only mark an event failed if this request successfully claimed it.
    if (eventClaimed) {
      try {
        await markWebhookEventFailed(event.id, error);
      } catch (trackingError) {
        console.error("Failed to update webhook event:", trackingError);
      }
    }

    throw error;
  }
};

export default completeOrder;
