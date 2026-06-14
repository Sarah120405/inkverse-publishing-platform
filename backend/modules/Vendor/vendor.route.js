import express from "express";
import { authorize } from "../../middleware/auth.roleAccess.js";
import { authMiddleware } from "../../middleware/auth.jwtToken.js"
import {
    createPricingController, getPendingOrdersController, getPricingController, getMyOrdersController,
    updateDeliveryStatusController, getPrintDetailController, updatePrintStatusController,
    dashboardController
} from './vendor.controller.js';


const router = express.Router();

router.post('/pricing', authMiddleware, authorize(['Vendor']), createPricingController);
router.get('/pricing', authMiddleware, authorize(['Vendor', 'Admin', 'Author']), getPricingController);
router.get('/pending-orders', authMiddleware, authorize(['Vendor']), getPendingOrdersController);
router.get('/print-detail/:orderId', authMiddleware, authorize(['Vendor']), getPrintDetailController);
router.patch('/print-status/:orderId', authMiddleware, authorize(['Vendor']), updatePrintStatusController);
router.patch('/delivery-status/:orderId', authMiddleware, authorize(['Vendor']), updateDeliveryStatusController);
router.get('/my-orders', authMiddleware, authorize(['Vendor']), getMyOrdersController);
router.get('/dashboard', authMiddleware, authorize(['Vendor']), dashboardController);

export default router;