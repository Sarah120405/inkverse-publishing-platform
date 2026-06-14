import response from "../../utils/response.js";
import prisma from "../../config/db.config.js";
import bcrypt from "bcrypt";
import { generateToken } from "../../middleware/auth.jwtToken.js";
import { sendEmail } from "../../middleware/email.notification.js";
import { createToken, verifyToken } from "../../utils/token.utils.js";

const userRegisterService = async (body) => {

    try {
        const { name, email, password, role } = body;

        if (role === 'Admin') {
            const adminExists = await prisma.user.findFirst({ where: { role: 'Admin' } });
            if (adminExists) {
                return response(400, false, "An Admin already exists on this platform");
            }
        }

        // Check if user already exists
        const userExist = await prisma.user.findUnique({ where: { email } });
        if (userExist) {
            return response(400, false, null, null, 'User already exists');
        }

        const hashedPwd = await bcrypt.hash(password, 10);
        const register = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPwd,
                role,
                wallet: {
                    create: {
                        totalBalance: 0,
                        totalWithdrawn: 0,
                        currentBalance: 0,
                    }
                }
            }
        });

        const emailVerifyToken = await createToken("VerifyEmail", register.id, new Date(Date.now() + 24 * 60 * 60 * 1000));

        const verifyLink = `http://localhost:5173/verify?token=${emailVerifyToken.token}`
        const emailContent = `
            <h1>Welcome ${name}</h1>
            <p>Thank you for registering with us. Please click on the link below to verify your email address.</p>
            <a href="${verifyLink}">Verify Email</a>
            <p>This link will expire in 24 hours.</p>`;

        await sendEmail(email, "User Registered", emailContent);
        return response(201, true, 'User registered successfully', { register, emailVerifyToken }, null);

    } catch (error) {
        console.log(error)
        return response(500, false, 'Internal Server Error', null, error)
    }
};

const loginService = async (body) => {
    try {
        const { email, password } = body;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return response(404, false, null, null, 'User not found');
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return response(401, false, null, null, 'Invalid password');
        }
        if (!user.isEmailVerified) {
            return response(403, false, null, null, 'Please verify your email first');
        }
        if (user.twoFactorEnabled) {
            const tempToken = await createToken("TwoFactorVerification", user.id, new Date(Date.now() + 5 * 60 * 1000));
            return response(200, true, '2FA required', { tempToken }, null);
        }
        const token = generateToken(user);
        return response(200, true, 'User logged in successfully', { user, token }, null);

    } catch (error) {
        console.log(error)
        return response(500, false, 'Internal Server Error', null, error)
    }
}

const VerifyEmailService = async (body) => {
    try {
        const { token } = body;
        const tokenData = await verifyToken(token, "VerifyEmail");
        if (!tokenData) {
            return response(400, false, null, null, 'Invalid or expired token');
        }

        const user = await prisma.user.findUnique({ where: { id: tokenData.userId } });
        if (!user) {
            return response(404, false, null, null, 'User not found');
        }

        const userUpdate = await prisma.user.update({
            where: { id: tokenData.userId },
            data: {
                isEmailVerified: true,
            }
        });
        await prisma.token.delete({ where: { id: tokenData.id } });
        return response(200, true, 'Email Verified successfully', userUpdate, null);
    } catch (error) {
        console.log(error);
        return response(500, false, 'Internal Server Error', null, error);
    }
}

const forgotPasswordService = async (body) => {
    try {
        const { email } = body;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return response(404, false, null, null, 'User not found');
        }

        const forgotToken = await createToken("ForgotPassword", user.id, new Date(Date.now() + 10 * 60 * 1000));

        const forgotLink = `http://localhost:5173/forgot-password?token=${forgotToken.token}`;
        const emailContent = `
            <h1>Welcome ${user.name}</h1>
            <p>Please click on the link below to reset your password.</p>
            <a href="${forgotLink}">Reset Password</a>
            <p>This link will expire in 10 minutes.</p>`;

        await sendEmail(email, "Forgot Password", emailContent);
        return response(200, true, 'Forgot password email sent successfully', forgotToken, null);

    } catch (error) {
        console.log(error)
        return response(500, false, 'Internal Server Error', null, error)
    }
}

const resetPasswordService = async (body) => {
    try {

        const { token, newPwd } = body;
        const resetToken = await verifyToken(token, "ForgotPassword");
        if (!resetToken) {
            return response(400, false, "Invalid or Expired Token", null, null)
        }

        const pwd = await bcrypt.hash(newPwd, 10);
        const pwdUpdate = await prisma.user.update({
            where: {
                id: resetToken.userId
            },
            data: {
                password: pwd

            }
        })
        await prisma.token.delete({ where: { id: resetToken.id } });
        return response(200, true, 'Password reset successfully', pwdUpdate, null);
    } catch (error) {
        console.log(error)
        return response(500, false, 'Internal Server Error', null, error)
    }
}

const getAllUsersService = async () => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
                isEmailVerified: true,
                createdAt: true,
            }
        });

        return response(200, true, 'Users fetched successfully', users, null);
    } catch (error) {
        return response(500, false, 'Internal Server Error', null, error);
    }
}

export {
    userRegisterService, loginService, VerifyEmailService, forgotPasswordService,
    resetPasswordService, getAllUsersService
};