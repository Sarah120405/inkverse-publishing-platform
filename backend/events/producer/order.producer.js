import crypto from "node:crypto";
import eventEmitter from "../eventEmitter.js";

export const publishedOrderCompleted = (result) => {
  for (const order of result.purchaseOrders) {
    const event = {
      eventId: crypto.randomUUID(),
      eventName: "order.completed",
      version: 1,
      occurredAt: new Date(),

      data: {
        orderId: order.id,
        userId: result.userId,
        transactionId: result.transactionId,
        amount: order.totalPrice.toString(),
        currency: result.currency,
      },
    };

    eventEmitter.emit("order.completed", event);
  }
};
