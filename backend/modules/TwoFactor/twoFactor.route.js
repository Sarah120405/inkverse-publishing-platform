import express from "express";
import { setup2FAController, verifySecretController, verifyLoginOTPController } from './twoFactor.controller.js';
import { authMiddleware } from '../../middleware/auth.jwtToken.js';

const router = express.Router();

router.post("/generate-secret", authMiddleware, setup2FAController);
router.post("/verify-secret", authMiddleware, verifySecretController);
router.post("/verify-login-otp", verifyLoginOTPController);
export default router;