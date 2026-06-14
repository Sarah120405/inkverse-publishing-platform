import prisma from '../../config/db.config.js';
import response from '../../utils/response.js';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { generateToken } from '../../middleware/auth.jwtToken.js';
import { verifyToken } from '../../utils/token.utils.js';

const setup2FA = async (userId) => {
    try {
        const secret = speakeasy.generateSecret({
            name: process.env.APP_NAME
        });
        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                twoFactorSecret: secret.base32,
            }
        });
        const qrCode = await QRCode.toDataURL(secret.otpauth_url);
        return response(200, true, 'Secret generated successfully', { secret: secret.base32, otpauth_url: secret.otpauth_url, qrCode }, null);
    } catch (error) {
        return response(500, false, 'Secret generated failed', null, error.message);
    }
};

const verifySecret = async (userId, token) => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: userId
            }
        });
        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token: token,
            window: 1
        });
        console.log(verified);
        if (!verified) {
            return response(400, false, 'Invalid token', null, null);
        }
        const update = await prisma.user.update({
            where: { id: userId },
            data: {
                twoFactorEnabled: true
            }
        });
        return response(200, true, 'Token verified successfully', null, null);

    } catch (error) {
        return response(500, false, 'Error occurred while verifying token', null, error.message);
    }
}

const verifyLoginOTP = async (tempToken, otpToken) => {
    try {
        const tokenData = await verifyToken(tempToken, "TwoFactorVerification");
        if (!tokenData) {
            return response(400, false, null, null, 'Invalid or expired token');
        }
        const user = await prisma.user.findUnique({ where: { id: tokenData.userId } });
        if (!user) {
            return response(404, false, null, null, 'User not found');
        }
        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token: otpToken,
            window: 1
        });
        if (!verified) {
            return response(400, false, 'Invalid token', null, null);
        }
        await prisma.token.delete({ where: { id: tokenData.id } });
        const token = generateToken(user);
        return response(200, true, 'Token verified successfully', { user, token }, null);
    } catch (error) {
        return response(500, false, 'Error occurred while verifying token', null, error.message);
    }
}

export { setup2FA, verifySecret, verifyLoginOTP };