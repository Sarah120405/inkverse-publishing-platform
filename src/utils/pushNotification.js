import { urlBase64ToUint8Array } from "./format";
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

export const getPushRegistration = async () => {
  if (!("serviceWorker" in navigator)) {
    throw new Error("Service Workers are not supported");
  }

  if (!("PushManager" in window)) {
    throw new Error("Push API is not supported");
  }

  try {
    const registration = await navigator.serviceWorker.ready;

    console.log("Active Service Worker:", registration);

    return registration;
  } catch (error) {
    console.error("Failed to get Service Worker:", error);
    throw error;
  }
};

export const createPushSubscription = async () => {
  const registration = await getPushRegistration();

  const permission = await Notification.requestPermission();

  if (permission !== "granted") {
    throw new Error("Notification permission was not granted");
  }

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
  });

  console.log("Push Subscription:", subscription);

  return subscription;
};
