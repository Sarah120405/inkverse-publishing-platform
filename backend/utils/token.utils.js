import prisma from "../config/db.config.js";
import crypto from "crypto";

const createToken = async (tokenType, userId, expiresAt) => {

    const token = crypto.randomBytes(32).toString("hex");
    const generateToken = await prisma.token.create({
        data: {
            token: token,
            type: tokenType,
            userId: userId,
            expiresAt: expiresAt
        }
    });

    return generateToken;
};

const verifyToken = async (token, tokenType) => {

    const tokenData = await prisma.token.findUnique({ where: { token: token } });
    console.log("--- Token Verification Debug ---");
    console.log("Token Data Found:", tokenData);
    console.log("Token Expiration:", tokenData?.expiresAt);
    console.log("Current Server Time:", new Date());
    console.log("Is Expired?:", tokenData ? tokenData.expiresAt < new Date() : "N/A");
    console.log("--------------------------------");

    if (!tokenData || tokenData.type != tokenType || tokenData.expiresAt < new Date()) {
        return null;
    }

    return tokenData;
}

export { createToken, verifyToken };