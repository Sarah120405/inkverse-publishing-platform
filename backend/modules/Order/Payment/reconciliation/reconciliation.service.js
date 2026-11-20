import prisma from "../../../../config/db.config.js";
import stripe from "../../../../config/stripe.config.js";
import fulfillSuccessfulPayment from "../paymentFulfilled.service.js";
import {
  determineReconciliationAction,
  validatePaymentIntent,
} from "./reconciliation.utils.js";

const getReconcilicationCandidates = async () => {
  const cutoffTime = new Date(Date.now() - 1 * 60 * 1000);

  const transaction = await prisma.transaction.findMany({
    where: {
      paymentMethod: "Stripe",
      paymentStatus: "Pending",
      stripePaymentIntentId: {
        not: null,
      },
      createdAt: {
        lte: cutoffTime,
      },
    },
    orderBy: {
      createdAt: "asc",
    },
    take: 50,
    select: {
      id: true,
      transactionId: true,
      userId: true,
      amount: true,
      currency: true,
      paymentStatus: true,
      stripePaymentIntentId: true,
      stripeStatus: true,
      createdAt: true,
      checkoutOrders: {
        select: {
          id: true,
          bookId: true,
          quantity: true,
          totalPrice: true,
          paymentStatus: true,
          userId: true,
        },
      },
    },
  });

  return transaction;
};

const retrieveCandidatePaymentIntents = async () => {
  const transactions = await getReconcilicationCandidates();

  const results = [];

  for (const transaction of transactions) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(
        transaction.stripePaymentIntentId,
      );
      const validation = validatePaymentIntent(transaction, paymentIntent);

      const decision = determineReconciliationAction(paymentIntent, validation);
      results.push({
        transaction,
        paymentIntent,
        validation,
        decision,
        retrievalError: null,
      });
    } catch (error) {
      results.push({
        transaction,
        paymentIntent: null,
        retrievalError: {
          message: error.message,
          code: error.code,
          type: error.type,
        },
      });
    }
  }
  return results;
};

const processReconciliationResults = async () => {
  const results = await retrieveCandidatePaymentIntents();

  const processedResults = [];

  for (const result of results) {
    const { transaction, paymentIntent, validation, decision, retrievalError } =
      result;

    if (retrievalError) {
      processedResults.push({
        transactionId: transaction.transactionId,
        action: "NEEDS_REVIEW",
        reason: retrievalError.message,
      });

      continue;
    }

    if (decision.action !== "RECOVER") {
      processedResults.push({
        transactionId: transaction.transactionId,
        action: decision.action,
        reason: decision.reason,
      });

      continue;
    }

    try {
      const fulfillment = await fulfillSuccessfulPayment(paymentIntent);

      processedResults.push({
        transactionId: transaction.transactionId,
        action: fulfillment.alreadyProcessed
          ? "ALREADY_PROCESSED"
          : "RECOVERED",
        fulfillment,
      });
    } catch (error) {
      processedResults.push({
        transactionId: transaction.transactionId,
        action: "NEEDS_REVIEW",
        reason: error.message,
      });
    }
  }

  return processedResults;
};

export {
  getReconcilicationCandidates,
  processReconciliationResults,
  retrieveCandidatePaymentIntents,
};
