import { Prisma } from "@prisma/client";
const validatePaymentIntent = (transaction, paymentIntent) => {
  const errors = [];
  if (transaction.stripePaymentIntentId !== paymentIntent.id) {
    errors.push("Payment Intent Id mismatch");
  }

  const expectedAmountPaise = transaction.amount.mul(100).toDecimalPlaces(0);

  if (!expectedAmountPaise.equals(new Prisma.Decimal(paymentIntent.amount))) {
    errors.push("Payment amount mismatch");
  }

  // 3. Currency validation
  if (
    transaction.currency?.toLowerCase() !==
    paymentIntent.currency?.toLowerCase()
  ) {
    errors.push("Payment currency mismatch");
  }

  // 4. Transaction metadata validation
  if (transaction.transactionId !== paymentIntent.metadata?.transactionId) {
    errors.push("Transaction ID metadata mismatch");
  }

  // 5. User metadata validation
  if (transaction.userId !== paymentIntent.metadata?.userId) {
    errors.push("User ID metadata mismatch");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

const determineReconciliationAction = (paymentIntent, validation) => {
  // Never process an invalid payment association.
  if (!validation.isValid) {
    return {
      action: "NEEDS_REVIEW",
      reason: "Payment validation failed",
    };
  }

  switch (paymentIntent.status) {
    case "succeeded":
      return {
        action: "RECOVER",
        reason: "Stripe confirms successful payment",
      };

    case "processing":
      return {
        action: "WAIT",
        reason: "Payment is still processing",
      };

    case "requires_action":
      return {
        action: "WAIT",
        reason: "Customer authentication is required",
      };

    case "requires_confirmation":
      return {
        action: "WAIT",
        reason: "Payment confirmation is pending",
      };

    case "requires_payment_method":
      return {
        action: "WAIT",
        reason: "A valid payment method is required",
      };

    case "canceled":
      return {
        action: "NEEDS_REVIEW",
        reason: "PaymentIntent has been canceled",
      };

    default:
      return {
        action: "NEEDS_REVIEW",
        reason: `Unexpected Stripe status: ${paymentIntent.status}`,
      };
  }
};
export { validatePaymentIntent, determineReconciliationAction };
