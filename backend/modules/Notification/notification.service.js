import prisma from "../../config/db.config.js";
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

export default savePushSubscription;
