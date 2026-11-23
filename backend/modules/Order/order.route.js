import express from "express";
import {
  createOrderController,
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

export default route;
