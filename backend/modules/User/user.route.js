import express from "express";
import { userProfileController, profileUpdateController, dashboardController } from "./user.controller.js";
import { authorize } from "../../middleware/auth.roleAccess.js";
import { authMiddleware } from "../../middleware/auth.jwtToken.js";

const route = express.Router();

route.get('/profile/:email', authorize(['Reader', 'Author', 'Admin']), userProfileController);
route.put('/profile/update/:email', authorize(['Reader']), profileUpdateController)
route.get('/dashboard', authMiddleware, authorize(['Reader', 'Vendor', 'Author']), dashboardController);


export default route;