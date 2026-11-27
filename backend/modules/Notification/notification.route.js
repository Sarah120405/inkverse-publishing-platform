import express from "express";
import { authMiddleware } from "../../middleware/auth.jwtToken.js";
import {
  savePushSubscriptionController,
  sendPushNotificationController,
} from "./notification.controller.js";

const router = express.Router();

router.post(
  "/push_subscription",
  authMiddleware,
  savePushSubscriptionController,
);
router.post(
  "/send_test_notification",
  authMiddleware,
  sendPushNotificationController,
);

export default router;
