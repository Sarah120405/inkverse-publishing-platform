/* import {
  getReconcilicationCandidates,
  retrieveCandidatePaymentIntents,
} from "./reconciliation.service.js";

import { validatePaymentIntent } from "./reconciliation.utils.js";

const testReconciliation = async () => {
  console.log("\n========== STEP 1: CANDIDATES ==========\n");

  const candidates = await getReconcilicationCandidates();

  console.table(
    candidates.map((transaction) => ({
      transactionId: transaction.transactionId,
      amount: transaction.amount.toString(),
      paymentStatus: transaction.paymentStatus,
      paymentIntentId: transaction.stripePaymentIntentId,
      createdAt: transaction.createdAt.toISOString(),
    })),
  );

  console.log("Total candidates:", candidates.length);

  console.log("\n========== STEP 2: STRIPE RETRIEVAL ==========\n");

  const results = await retrieveCandidatePaymentIntents();

  console.table(
    results.map(({ transaction, paymentIntent, retrievalError }) => ({
      transactionId: transaction.transactionId,
      paymentIntentId: paymentIntent?.id ?? null,
      stripeStatus: paymentIntent?.status ?? null,
      stripeAmount: paymentIntent?.amount ?? null,
      stripeCurrency: paymentIntent?.currency ?? null,
      retrievalError: retrievalError?.message ?? null,
    })),
  );

  console.log("\n========== STEP 3: VALIDATION ==========\n");

  for (const { transaction, paymentIntent, retrievalError } of results) {
    if (retrievalError || !paymentIntent) {
      console.log("Skipping validation:", transaction.transactionId);
      continue;
    }

    const validation = validatePaymentIntent(transaction, paymentIntent);

    console.log({
      transactionId: transaction.transactionId,
      isValid: validation.isValid,
      errors: validation.errors,
    });
  }
  const { transaction, paymentIntent } = results[0];

  // Test incorrect amount
  const wrongAmount = validatePaymentIntent(
    {
      ...transaction,
      amount: transaction.amount.plus(100),
    },
    paymentIntent,
  );

  console.log("WRONG AMOUNT:", wrongAmount);

  // Test incorrect user
  const wrongUser = validatePaymentIntent(
    {
      ...transaction,
      userId: "incorrect-user",
    },
    paymentIntent,
  );

  console.log("WRONG USER:", wrongUser);

  // Test incorrect transaction ID
  const wrongTransaction = validatePaymentIntent(
    {
      ...transaction,
      transactionId: "TXN-INCORRECT",
    },
    paymentIntent,
  );

  console.log("WRONG TRANSACTION:", wrongTransaction);
};

testReconciliation()
  .catch(console.error)
  .finally(async () => {
    const { default: prisma } = await import("../../../../config/db.config.js");
    await prisma.$disconnect();
  });
 */
import stripe from "../../../../config/db.config.js";
import fulfillSuccessfulPayment from "../paymentFulfilled.service.js";

const PAYMENT_INTENT_ID = "pi_3UdqUD30zSHzI3pT1bGtjMCn";

const runTest = async () => {
  try {
    const paymentIntent =
      await stripe.paymentIntents.retrieve(PAYMENT_INTENT_ID);

    const results = await Promise.allSettled([
      fulfillSuccessfulPayment(paymentIntent),
      fulfillSuccessfulPayment(paymentIntent),
    ]);

    console.log("Concurrent fulfilment results:");

    results.forEach((result, index) => {
      console.log(`Attempt ${index + 1}:`, result);
    });
  } catch (error) {
    console.error("Test failed:", error);
  }
};

runTest();
