import { setup2FA, verifySecret, verifyLoginOTP } from './twoFactor.service.js';
import { verifySecretSchema, verifyLoginOTPSchema } from './twoFactor.validator.js';

const setup2FAController = async (req, res) => {
    const result = await setup2FA(req.user.id);
    return res.status(result.status).json(result);
};

const verifySecretController = async (req, res) => {

    const { error } = verifySecretSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    const result = await verifySecret(req.user.id, req.body.token);
    return res.status(result.status).json(result);
}

const verifyLoginOTPController = async (req, res) => {

    const { error } = verifyLoginOTPSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    const result = await verifyLoginOTP(req.body.tempToken, req.body.token);
    return res.status(result.status).json(result);
}

export { setup2FAController, verifySecretController, verifyLoginOTPController };