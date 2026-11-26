export const requestNotificationPermission = async () => {
  if (!("Notification" in window)) {
    console.log("Notifications are not supported");
    return false;
  }

  const permission = await Notification.requestPermission();

  return permission === "granted";
};

export const showNotification = (title, options = {}) => {
  if (!("Notification" in window)) {
    return;
  }

  if (Notification.permission !== "granted") {
    console.log("Notification permission not granted");
    return;
  }

  new Notification(title, {
    body: options.body || "",
    icon: options.icon || "/favicon.ico",
  });
};
