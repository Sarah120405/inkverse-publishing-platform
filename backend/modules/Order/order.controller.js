import { createOrder, getMyOrder } from "./order.service.js";
import { OrderSchema } from "./order.validator.js";
import stripe from "../../config/stripe.config.js";
import completeOrder from "./Payment/completeOrder.service.js";
import { getSavedPaymentMethods } from "./Payment/stripeCustomer.service.js";
const createOrderController = async (req, res) => {
  const { error, value } = OrderSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  console.log("SAVE PAYMENT", value.savePaymentMethod);

  const order = await createOrder(
    req.body.books,
    req.user.id,
    value.savePaymentMethod,
    value.paymentMethodId,
  );
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

      await completeOrder(paymentIntent, event);
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

const getSavedPaymentMethodsController = async (req, res) => {
  const paymentMethods = await getSavedPaymentMethods(req.user.id);
  return res.status(200).json({
    status: 200,
    success: true,
    data: paymentMethods,
  });
};

export {
  createOrderController,
  getMyOrderController,
  getSavedPaymentMethodsController,
  stripeWebhookController,
};
