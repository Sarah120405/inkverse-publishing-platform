import express from "express";
import index_api from "./index_api.js";
import dotenv from "dotenv";
import cors from "cors";
import { stripeWebhookController } from "./modules/Order/order.controller.js";
import {
  getReconcilicationCandidates,
  retrieveCandidatePaymentIntents,
} from "./modules/Order/Payment/reconciliation/reconciliation.service.js";

dotenv.config();
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is missing");
}

console.log("Stripe configuration loaded");
const app = express();
app.use(cors());
app.post(
  "/api/webhooks/stripe",
  express.raw({ type: "application/json" }),
  stripeWebhookController,
);

app.use(express.json());
app.use("/api", index_api);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

const candidates = await getReconcilicationCandidates();

console.log(
  candidates.map((transaction) => ({
    transactionId: transaction.transactionId,
    amount: transaction.amount.toString(),
    paymentIntentId: transaction.stripePaymentIntentId,
    createdAt: transaction.createdAt,
    orders: transaction.checkoutOrders.length,
  })),
);

const results = await retrieveCandidatePaymentIntents();

console.log(
  results.map(({ transaction, paymentIntent, retrievalError }) => ({
    transactionId: transaction.transactionId,
    paymentIntentId: transaction.stripePaymentIntentId,
    stripeStatus: paymentIntent?.status ?? null,
    stripeAmount: paymentIntent?.amount ?? null,
    stripeCurrency: paymentIntent?.currency ?? null,
    error: retrievalError?.message ?? null,
  })),
);

export default app;
