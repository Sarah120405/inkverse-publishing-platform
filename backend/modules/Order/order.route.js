import express from "express";
import { createOrderController, getMyOrderController } from "./order.controller.js";
import { authorize } from "../../middleware/auth.roleAccess.js";

const route = express.Router();

route.get('/my-orders', authorize(['Reader', 'Admin', 'Author']), getMyOrderController);
route.post('/order/:bookId', authorize(['Reader', 'Author']), createOrderController);

export default route;
