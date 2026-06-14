import express from "express";
import { createSettingController, getCommissionRateController, updateCommissionRateController } from "./setting.controller.js";
import { authMiddleware } from "../../middleware/auth.jwtToken.js";
import { authorize } from "../../middleware/auth.roleAccess.js";

const router = express.Router();

router.post("/create", authMiddleware, authorize(['Admin']), createSettingController);
router.get("/commission-rate", authMiddleware, getCommissionRateController);
router.patch("/commission-rate", authMiddleware, authorize(['Admin']), updateCommissionRateController);

export default router;
