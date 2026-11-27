self.addEventListener("install", (event) => {
  console.log("Service worker installed");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker activated");
});

self.addEventListener("push", (event) => {
  const data = event.data?.json() || {};

  const notificationPromise = self.registration.showNotification(
    data.title || "Inkverse",
    {
      body: data.body || "You have a new notification.",
      icon: data.icon || "/favicon.ico",
      data: {
        url: data.url || "/",
      },
    },
  );

  event.waitUntil(notificationPromise);
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const notificationUrl = new URL(
    event.notification.data?.url || "/",
    self.location.origin,
  );

  if (notificationUrl.origin !== self.location.origin) return;

  event.waitUntil(
    (async () => {
      const windowClients = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      for (const client of windowClients) {
        if (new URL(client.url).origin !== self.location.origin) {
          continue;
        }

        try {
          await client.focus();

          if (client.url !== notificationUrl.href) {
            await client.navigate(notificationUrl.href);
          }

          return;
        } catch (error) {
          // A window can become inactive after matchAll() returns it.
          console.log("Notification Error: ", error);
        }
      }

      await self.clients.openWindow(notificationUrl.href);
    })().catch((error) => {
      console.error("Notification click navigation failed:", error);
    }),
  );
});
