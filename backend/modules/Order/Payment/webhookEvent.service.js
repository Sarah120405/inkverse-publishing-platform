import prisma from "../../../config/db.config.js";

const claimWebhookEvent = async (event) => {
  // 1. Save the event if it has not been received before.
  try {
    await prisma.webhookEvent.create({
      data: {
        id: event.id,
        type: event.type,
        payload: event,
        status: "Received",
      },
    });
  } catch (error) {
    // A duplicate event ID means Stripe has already delivered this event.
    if (error.code !== "P2002") {
      throw error;
    }
  }

  const existingEvent = await prisma.webhookEvent.findUnique({
    where: { id: event.id },
  });

  if (!existingEvent) {
    throw new Error("Webhook event could not be found");
  }

  if (
    existingEvent.status === "Processed" ||
    existingEvent.status === "Ignored"
  ) {
    return { claimed: false, status: existingEvent.status };
  }

  if (existingEvent.status === "Processing") {
    return { claimed: false, status: "Processing" };
  }

  // 4. Atomically claim Received or Failed events.
  const claim = await prisma.webhookEvent.updateMany({
    where: {
      id: event.id,
      status: { in: ["Received", "Failed"] },
    },
    data: {
      status: "Processing",
      attempts: { increment: 1 },
      lastError: null,
    },
  });

  if (claim.count === 0) {
    return { claimed: false, status: "Already claimed" };
  }

  return { claimed: true, status: "Processing" };
};

const markWebhookEventProcessed = async (eventId) => {
  await prisma.webhookEvent.update({
    where: { id: eventId },
    data: {
      status: "Processed",
      processedAt: new Date(),
      lastError: null,
    },
  });
};

const markWebhookEventFailed = async (eventId, error) => {
  await prisma.webhookEvent.update({
    where: { id: eventId },
    data: {
      status: "Failed",
      lastError: error.message || "Unknown webhook processing error",
    },
  });
};

const markWebhookEventIgnored = async (eventId) => {
  await prisma.webhookEvent.update({
    where: { id: eventId },
    data: {
      status: "Ignored",
      processedAt: new Date(),
    },
  });
};

export {
  claimWebhookEvent,
  markWebhookEventProcessed,
  markWebhookEventFailed,
  markWebhookEventIgnored,
};
