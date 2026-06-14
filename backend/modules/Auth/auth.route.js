import express from "express";
import {
    loginController, userRegisterController, forgotPasswordController,
    resetPasswordController, VerifyEmailController, getAllUsersController
} from "./auth.controller.js";
import { authorize } from "../../middleware/auth.roleAccess.js";

const route = express.Router();

route.post('/register-user', userRegisterController);
route.post('/login', loginController);
route.post('/forgot-password', forgotPasswordController);
route.post('/reset-password', resetPasswordController);
route.post('/verify-email', VerifyEmailController);
route.get("/users", authorize(["Admin"]), getAllUsersController);

export default route;