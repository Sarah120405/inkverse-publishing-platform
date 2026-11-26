const registerServiceWorker = async () => {
  if (!("serviceWorker" in navigator)) {
    console.log("Service Workers are not supported");
    return;
  }

  try {
    const registration =
      await navigator.serviceWorker.register("/service-worker.js");

    console.log("Service Worker registered:", registration);
  } catch (error) {
    console.error("Service Worker registration failed:", error);
  }
};

export default registerServiceWorker;
