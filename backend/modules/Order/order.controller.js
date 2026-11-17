import {
  createOrder,
  getMyOrder,
  completeOnlineOrder,
} from "./order.service.js";
import { OrderSchema } from "./order.validator.js";
import stripe from "../../config/stripe.config.js";

const createOrderController = async (req, res) => {
  const { error } = OrderSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  const order = await createOrder(req.body.books, req.user.id);
  return res.status(order.status).json(order);
};

const stripeWebhookController = async (req, res) => {
  const signature = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (error) {
    console.error("Webhook signature verification failed:", error.message);
    return res.status(400).send("Invalid webhook signature");
  }

  try {
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;

      await completeOnlineOrder(paymentIntent);
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("Webhook processing failed:", error);
    return res.status(500).json({ received: false });
  }
};

const getMyOrderController = async (req, res) => {
  const myOrder = await getMyOrder(req.user.id);
  return res.status(myOrder.status).json(myOrder);
};

export { createOrderController, getMyOrderController, stripeWebhookController };
