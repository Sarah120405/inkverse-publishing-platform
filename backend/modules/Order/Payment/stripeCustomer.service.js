import prisma from "../../../config/db.config.js";
import stripe from "../../../config/stripe.config.js";
const getOrCreateStripeCustomer = async (userId) => {
  if (!userId) {
    throw new Error("User ID is required to create a Stripe Customer");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      stripeCustomerId: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const verifyCustomer = async (customerId) => {
    const customer = await stripe.customers.retrieve(customerId);

    if (customer.deleted) {
      throw new Error(
        "The saved Stripe Customer has been deleted. Customer mapping requires repair.",
      );
    }
    if (customer.metadata?.userId !== user.id) {
      throw new Error("Stripe Customer does not belong to this Inkverse user");
    }

    return customer;
  };

  if (user.stripeCustomerId) {
    return await verifyCustomer(user.stripeCustomerId);
  }

  const customer = await stripe.customers.create(
    {
      name: user.name,
      email: user.email,
      metadata: {
        userId: user.id,
      },
    },
    {
      idempotencyKey: `inkverse_customer_${user.id}`,
    },
  );

  const result = await prisma.user.updateMany({
    where: { id: userId },
    data: {
      stripeCustomerId: customer.id,
    },
  });
  if (result.count === 0) {
    const latestUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { stripeCustomerId: true },
    });

    if (!latestUser?.stripeCustomerId) {
      throw new Error("Unable to save or retrieve Stripe Customer ID");
    }

    return await verifyCustomer(latestUser.stripeCustomerId);
  }

  return customer;
};

const getSavedPaymentMethods = async (userId) => {
  if (!userId) {
    throw new Error("User ID is required");
  }
  const customer = await getOrCreateStripeCustomer(userId);

  const paymentMethods = await stripe.paymentMethods.list({
    customer: customer.id,
    type: "card",
    limit: 100,
  });

  return paymentMethods.data.map((method) => ({
    id: method.id,
    type: method.type,
    brand: method.card.brand,
    last4: method.card.last4,
    expiryMonth: method.card.exp_month,
    expiryYear: method.card.exp_year,
  }));
};

const createSetupIntent = async (userId) => {
  if (!userId) {
    throw new Error("User ID is required");
  }
  const customer = await getOrCreateStripeCustomer(userId);
  const setupIntents = await stripe.setupIntents.create({
    customer: customer.id,
    usage: "off_session",
    automatic_payment_methods: {
      enabled: true,
    },
    metadata: {
      userId,
    },
  });

  if (!setupIntents.client_secret) {
    throw new Error("SetupIntent client secret unavailable");
  }

  return {
    setupIntentId: setupIntents.id,
    clientSecret: setupIntents.client_secret,
    status: setupIntents.status,
  };
};
export { getOrCreateStripeCustomer, getSavedPaymentMethods, createSetupIntent };
export default {
  getOrCreateStripeCustomer,
  getSavedPaymentMethods,
  createSetupIntent,
};
