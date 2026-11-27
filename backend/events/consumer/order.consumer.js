import eventEmitter from "../eventEmitter.js";
import { sendPushNotification } from "../../modules/Notification/notification.service.js";
eventEmitter.on("order.completed", (event) => {
  console.log("Order completed event received");
  console.log("Order ID: ", event.data.orderId);
});

eventEmitter.on("order.completed", async (event) => {
  try {
    console.log("Preparing purchase notification...");

    const result = await sendPushNotification(event.data.userId, {
      title: "Purchase Successful!",
      body: "Your book purchase has been completed successfully.",
      url: "http://localhost:5173/dashboard/reader",
    });

    console.log("Purchase notification result:", result);
  } catch (error) {
    console.error("Purchase notification failed:", error);
  }
});
