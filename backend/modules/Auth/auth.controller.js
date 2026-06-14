import {
    userRegisterService, loginService, forgotPasswordService, getAllUsersService,
    resetPasswordService, VerifyEmailService
} from "./auth.service.js";
import { userSchema, loginSchema } from "./auth.validator.js";

const userRegisterController = async (req, res) => {

    const { error } = userSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    const result = await userRegisterService(req.body);
    return res.status(result.status).json(result);
};

const loginController = async (req, res) => {

    const { error } = loginSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    const login = await loginService(req.body);
    return res.status(login.status).json(login);
};

const forgotPasswordController = async (req, res) => {
    const password = await forgotPasswordService(req.body);
    return res.status(password.status).json(password);
};

const resetPasswordController = async (req, res) => {
    const password = await resetPasswordService(req.body);
    return res.status(password.status).json(password);
};

const VerifyEmailController = async (req, res) => {
    const verify = await VerifyEmailService(req.body);
    return res.status(verify.status).json(verify);
}

const getAllUsersController = async (req, res) => {
    const users = await getAllUsersService();
    return res.status(users.status).json(users);
}
export {
    userRegisterController, loginController, forgotPasswordController,
    resetPasswordController, VerifyEmailController, getAllUsersController
};