import savePushSubscription from "./notification.service.js";

const savePushSubscriptionController = async (req, res) => {
  try {
    const subscription = req.body;

    if (
      !subscription?.endpoint ||
      !subscription?.keys?.p256dh ||
      !subscription?.keys?.auth
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid push subscription",
      });
    }

    const result = await savePushSubscription(req.user.id, subscription);

    return res.status(201).json({
      success: true,
      message: "Push subscription saved successfully",
      data: result,
    });
  } catch (error) {
    console.error("Save push subscription error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to save push subscription",
    });
  }
};

export { savePushSubscriptionController };
