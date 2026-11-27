import prisma from "../../config/db.config.js";
import webpush from "../../config/pushNotification.config.js";

const savePushSubscription = async (userId, subscription) => {
  const { endpoint, keys } = subscription;

  return await prisma.pushSubscription.upsert({
    where: {
      endpoint,
    },
    update: {
      userId,
      p256dh: keys.p256dh,
      auth: keys.auth,
    },
    create: {
      userId,
      endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
    },
  });
};

const isRetryableError = (error) => {
  const retryableStatuses = [408, 429, 500, 502, 503, 504];

  // Network errors without an HTTP response status
  if (!error.statusCode) {
    return true;
  }

  return retryableStatuses.includes(error.statusCode);
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const sendWithRetry = async (subscription, payload) => {
  const MAX_ATTEMPTS = 3;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      await webpush.sendNotification(subscription, JSON.stringify(payload), {
        TTL: 60,
        urgency: "high",
      });

      return {
        success: true,
        attempts: attempt,
      };
    } catch (error) {
      // Permanent subscription failure
      if ([404, 410].includes(error.statusCode)) {
        throw error;
      }

      if (!isRetryableError(error)) {
        throw error;
      }
      // Stop after maximum attempts
      if (attempt === MAX_ATTEMPTS) {
        throw error;
      }

      const baseDelay = Math.min(1000 * 2 ** (attempt - 1), 30000);
      const waitTime = Math.random() * baseDelay;
      console.log(`Retrying notification in ${waitTime / 1000} seconds.`);

      await delay(waitTime);
    }
  }
};

const sendPushNotification = async (userId, payload) => {
  // Retrieves all possible subscription of a user eg: edge, chrome, firefox etc
  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId },
  });
  // all settled ensure
  const results = await Promise.allSettled(
    subscriptions.map(async (item) => {
      const subscription = {
        endpoint: item.endpoint,
        keys: {
          p256dh: item.p256dh,
          auth: item.auth,
        },
      };

      try {
        // Send notification to each subscription
        /* await webpush.sendNotification(subscription, JSON.stringify(payload), {
          TTL: 60,
          urgency: "high",
        }); */

        await sendWithRetry(subscription, payload);
      } catch (error) {
        // 404 and 410 mean this subscription is no longer valid.
        if (error.statusCode === 404 || error.statusCode === 410) {
          await prisma.pushSubscription.delete({
            where: { id: item.id },
          });
        }

        throw error;
      }
    }),
  );

  results.forEach((result, index) => {
    if (result.status === "rejected") {
      console.error(
        `Push notification failed for subscription ${index + 1}:`,
        result.reason,
      );
    }
  });

  return {
    total: subscriptions.length,
    successful: results.filter((result) => result.status === "fulfilled")
      .length,
    failed: results.filter((result) => result.status === "rejected").length,
  };
};

export { savePushSubscription, sendPushNotification };
