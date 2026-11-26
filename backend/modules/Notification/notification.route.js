import express from "express";
import { authMiddleware } from "../../middleware/auth.jwtToken.js";
import { savePushSubscriptionController } from "./notification.controller.js";

const router = express.Router();

router.post(
  "/push_subscription",
  authMiddleware,
  savePushSubscriptionController,
);

export default router;
