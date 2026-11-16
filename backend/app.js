import express from "express";
import index_api from "./index_api.js";
import dotenv from "dotenv";
import cors from "cors";
import { stripeWebhookController } from "./modules/Order/order.controller.js";

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

export default app;
