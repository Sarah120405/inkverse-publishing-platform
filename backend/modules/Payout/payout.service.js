import response from "../../utils/response.js";
import prisma from '../../config/db.config.js';

const requestPayout = async (body, userId) => {

    try {
        const { amount, bankDetails } = body;
        if (amount <= 0) {
            return response(400, false, "Amount must be greater than zero", null, null);
        }
        const wallet = await prisma.wallet.findUnique({
            where: {
                userId,
            },
        });
        if (wallet.currentBalance < amount) {
            return response(400, false, "Insufficient balance", null, null);
        }

        const transaction = await prisma.$transaction(async (prisma) => {
            const updatedWaller = await prisma.wallet.update({
                where: {
                    userId,
                },
                data: {
                    currentBalance: { decrement: amount },
                },
            });
            const payoutRequest = await prisma.payoutRequest.create({
                data: {
                    userId,
                    amount,
                    paymentStatus: "Pending",
                    bankDetails: bankDetails,
                },
            });
            return { updatedWaller, payoutRequest };
        });

        return response(200, true, "Payout request created successfully", transaction);
    } catch (error) {
        return response(500, false, "Internal Server Error", null, error.message);
    }
};

const getAllPayoutRequest = async () => {
    try {
        const payoutRequest = await prisma.payoutRequest.findMany({
            include: { user: true }
        });
        return response(200, true, "Payout requests fetched successfully", payoutRequest, null);
    } catch (error) {
        return response(500, false, "Internal Server Error", null, error.message);
    }
};

const processPayout = async (body) => {

    try {
        const { payoutId, paymentStatus } = body;
        const payoutRequest = await prisma.payoutRequest.findUnique({
            where: {
                id: payoutId,
            },
        });
        if (payoutRequest.paymentStatus === "Paid" || payoutRequest.paymentStatus === "Rejected") {
            return response(400, false, "Payout request is already paid or rejected", null, null);
        }
        let updatedPayoutRequest = null, updatedWallet = null;
        const wallet = await prisma.wallet.findUnique({ where: { userId: payoutRequest.userId } });

        if (paymentStatus === "Paid") {

            const transaction = await prisma.$transaction(async (prisma) => {
                updatedPayoutRequest = await prisma.payoutRequest.update({
                    where: {
                        id: payoutId,
                    },
                    data: {
                        paymentStatus: "Paid",
                    },
                });
                updatedWallet = await prisma.wallet.update({
                    where: {
                        userId: payoutRequest.userId,
                    },
                    data: {
                        totalWithdrawn: { increment: payoutRequest.amount },
                    },
                });
                return { updatedPayoutRequest, updatedWallet };
            });
            return response(200, true, "Payout request processed successfully", transaction, null);
        }
        else if (paymentStatus === "Rejected") {
            const transaction = await prisma.$transaction(async (prisma) => {
                updatedPayoutRequest = await prisma.payoutRequest.update({
                    where: {
                        id: payoutId,
                    },
                    data: {
                        paymentStatus: "Rejected",
                    },
                });
                updatedWallet = await prisma.wallet.update({
                    where: {
                        userId: payoutRequest.userId,
                    },
                    data: {
                        currentBalance: { increment: payoutRequest.amount }
                    },
                });
                return { updatedPayoutRequest, updatedWallet };
            });
            return response(200, true, "Payout request rejected successfully", transaction, null);
        }
        else {
            return response(400, false, "Invalid payment status", null, null);
        }
    } catch (error) {
        return response(500, false, "Internal Server Error", null, error.message);
    }
}

export {
    requestPayout, getAllPayoutRequest, processPayout
};
