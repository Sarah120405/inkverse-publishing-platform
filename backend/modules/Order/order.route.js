import express from "express";
import {
  createOrderController,
  createSetupIntentController,
  getMyOrderController,
  getSavedPaymentMethodsController,
} from "./order.controller.js";
import { authorize } from "../../middleware/auth.roleAccess.js";

const route = express.Router();

route.get(
  "/my-orders",
  authorize(["Reader", "Admin", "Author"]),
  getMyOrderController,
);

route.get(
  "/saved_payment_methods",
  authorize(["Reader", "Author"]),
  getSavedPaymentMethodsController,
);
route.post("/order", authorize(["Reader", "Author"]), createOrderController);
route.post(
  "/create_setup_intent",
  authorize(["Reader", "Author"]),
  createSetupIntentController,
);
export default route;
