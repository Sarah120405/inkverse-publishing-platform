import express from "express";
import {
    addToCartController, removeFromCartController,
    clearCartController, getMyCartController
} from "./cart.controller.js";
import { authMiddleware } from "../../middleware/auth.jwtToken.js";
import { authorize } from "../../middleware/auth.roleAccess.js";

const route = express.Router();
route.post('/add-to-cart/:bookId', authMiddleware, authorize(['Reader']), addToCartController);
route.delete('/remove-from-cart/:bookId', authMiddleware, removeFromCartController);
route.get('/my-cart', authMiddleware, getMyCartController);
route.delete('/cart', authMiddleware, clearCartController);

export default route;
