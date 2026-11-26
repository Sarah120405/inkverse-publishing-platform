import eventEmitter from "../eventEmitter.js";

eventEmitter.on("order.completed", (event) => {
  console.log("Order completed event received");
  console.log("Order ID: ", event.data.orderId);
});

eventEmitter.on("order.completed", async (event) => {
  try {
    console.log("Preparing purchase notification...");

    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log("Purchase notification sent to:", event.data.userId);
  } catch (error) {
    console.error("Purchase notification failed:", error);
  }
});
