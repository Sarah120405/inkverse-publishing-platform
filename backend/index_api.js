import express from "express";
import authRoute from "./modules/Auth/auth.route.js";
import bookRoute from "./modules/Book/book.route.js";
import purchaseRoute from "./modules/Order/order.route.js";
import cartRoute from "./modules/Cart/cart.route.js";
import userRoute from "./modules/User/user.route.js";
import vendorRoute from "./modules/Vendor/vendor.route.js";
import payoutRoute from "./modules/Payout/payout.route.js";
import settingRoute from "./modules/Setting/setting.route.js";
import twoFactorAuthRoute from "./modules/TwoFactor/twoFactor.route.js";

const route = express.Router();

route.use('/auth', authRoute);
route.use('/user', userRoute);
route.use('/book', bookRoute);
route.use('/order', purchaseRoute);
route.use('/cart', cartRoute);
route.use('/vendor', vendorRoute);
route.use('/payout', payoutRoute);
route.use('/setting', settingRoute);
route.use('/twoFactorAuth', twoFactorAuthRoute);

export default route;