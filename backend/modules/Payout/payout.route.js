import express from "express";
import { requestPayoutController, getAllPayoutRequestController, processPayoutController } from "./payout.controller.js";
import { authMiddleware } from '../../middleware/auth.jwtToken.js';
import { authorize } from '../../middleware/auth.roleAccess.js';

const router = express.Router();

router.post("/request-payout", authMiddleware, authorize(["Author", "Vendor"]), requestPayoutController);
router.get("/get-payout-request", authMiddleware, authorize(["Admin"]), getAllPayoutRequestController);
router.post('/process-payout', authMiddleware, authorize(["Admin"]), processPayoutController);

export default router;
