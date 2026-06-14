import response from "../../utils/response.js";
import prisma from "../../config/db.config.js";

const createPricing = async (pricingData, vendorId) => {
    try {
        const existing = await prisma.vendorProfile.findUnique({ where: { userId: vendorId } })
        if (existing) {
            return response(400, false, "Pricing already exists, use update instead", null, null)
        }
        const pricing = await prisma.vendorProfile.create({
            data: {
                userId: vendorId,
                perPageCost: pricingData.perPageCost,
            }
        })
        return response(201, true, "Pricing created successfully", pricing, null);
    } catch (error) {
        return response(500, false, "Error occurred while creating pricing", null, error.message);
    }
}

const getPricing = async (vendorId) => {
    try {
        const pricing = await prisma.vendorProfile.findUnique({ where: { userId: vendorId } });

        if (!pricing) {
            return response(404, false, "Pricing not found", null, null);
        }
        return response(200, true, "Pricing retrieved successfully", pricing, null);
    } catch (error) {
        return response(500, false, "Error occurred while retrieving pricing", null, error.message);
    }
}

const getPendingOrders = async (id) => {

    try {
        const pendingOrder = await prisma.printingOrder.findMany({
            where: {
                vendorId: id,
                deliveryStatus: "Pending"
            },
            include: {
                orderBook: true,
                authorOrder: true
            }
        })
        if (pendingOrder.length === 0) {
            return response(200, false, "No pending orders found", null, null);
        }
        return response(200, true, "Pending Orders retrieved successfully", pendingOrder, null);
    } catch (error) {
        return response(500, false, "Error occurred while retrieving pending orders", null, error);
    }
}
const getPrintDetail = async (orderId, vendorId) => {
    try {
        const printDetail = await prisma.printingOrder.findFirst({
            where: {
                vendorId: vendorId, id: orderId
            }
        });
        if (!printDetail) {
            return response(200, false, "No print detail found", null, null);
        }
        return response(200, true, "Print detail retrieved successfully", printDetail, null);
    } catch (error) {
        return response(500, false, "Error occurred while retrieving print detail", null, error);
    }
}

// Pending status if vendor accepts the order, Rejected status if vendor rejects the order
const updatePrintStatus = async (orderId, status, vendorId) => {
    try {
        const transaction = await prisma.$transaction(async (tx) => {

            const order = await tx.printingOrder.findUnique({
                where: { id: orderId }
            });
            if (!order) {
                throw new Error("Order not found");
            }
            if (order.vendorId !== vendorId) {
                throw new Error("Unauthorized to update this order");
            }

            if (status === "Accepted" && order.printStatus !== "Accepted") {
                const authorWallet = await tx.wallet.findUnique({ where: { userId: order.authorId } });
                if (!authorWallet || authorWallet.currentBalance < order.advanceAmount) {
                    throw new Error("INSUFFICIENT_BALANCE");
                }
                await tx.wallet.update({
                    where: { userId: order.authorId },
                    data: {
                        currentBalance: { decrement: order.advanceAmount }
                    }
                });
            }

            const updatedOrder = await tx.printingOrder.update({
                where: { id: orderId },
                data: { printStatus: status }
            });

            return updatedOrder;
        });
        return response(200, true, "Print status updated successfully", transaction, null);
    } catch (error) {
        if (error.message === "Order not found") {
            return response(404, false, "Order not found", null, null);
        }
        if (error.message === "Unauthorized to update this order") {
            return response(403, false, "Unauthorized to update this order", null, null);
        }
        if (error.message === "INSUFFICIENT_BALANCE") {
            return response(400, false, "Author do not have enough balance in wallet to pay the advance", null, null);
        }
        return response(500, false, "Error occurred while updating print status", null, error);
    }
}

// Pending, Printing, Shipped, Delivered status are updated by vendor

const updateDeliveryStatus = async (orderId, deliveryStatus, vendorId) => {
    try {
        const order = await prisma.printingOrder.findUnique({ where: { id: orderId } });

        if (!order) {
            return response(404, false, "Order not found", null, null);
        }
        if (order.vendorId !== vendorId) {
            return response(403, false, "Unauthorized to update this order", null, null);
        }
        if (order.deliveryStatus === "Delivered") {
            return response(400, false, "Order has already been delivered", null, null);
        }
        const transaction = await prisma.$transaction(async (tx) => {

            const updatedOrder = await tx.printingOrder.update({
                where: { id: orderId },
                data: { deliveryStatus: deliveryStatus }
            });

            const admin = await tx.user.findFirst({ where: { role: "Admin" }, orderBy: { createdAt: "asc" } });
            if (!admin) throw new Error("Platform Admin not found");

            if (deliveryStatus === "Delivered") {

                const totalAmount = updatedOrder.quotationAmount;
                const setting = await tx.setting.findUnique({ where: { key: "commission_rate" } });
                const commissionRate = setting ? parseFloat(setting.value) : 0.1;
                const commisionAmount = totalAmount * commissionRate;
                const vendorAmount = totalAmount - commisionAmount;
                const updateVendorWallet = await tx.wallet.update({
                    where: { userId: vendorId },
                    data: {
                        totalBalance: { increment: vendorAmount },
                        currentBalance: { increment: vendorAmount }
                    }
                });
                const updateAdminWallet = await tx.wallet.update({
                    where: { userId: admin.id },
                    data: {
                        totalBalance: { increment: commisionAmount },
                        currentBalance: { increment: commisionAmount }
                    }
                });
                await tx.transaction.updateMany({
                    where: { printingOrderId: orderId },
                    data: { paymentStatus: "Paid" }
                });
                const txn = await tx.transaction.findFirst({
                    where: { printingOrderId: orderId }
                });

                const authorWallet = await tx.wallet.findUnique({ where: { userId: order.authorId } });
                const totalAuthorAmount = updatedOrder.quotationAmount;
                const remainingToPay = totalAuthorAmount - updatedOrder.advanceAmount;

                if (!authorWallet || authorWallet.currentBalance < remainingToPay) {
                    throw new Error("INSUFFICIENT_BALANCE");
                }
                await tx.wallet.update({
                    where: { userId: order.authorId },
                    data: {
                        currentBalance: { decrement: remainingToPay }
                    }
                });
                if (txn && txn.purchaseOrderId) {
                    await tx.purchaseOrder.update({
                        where: { id: txn.purchaseOrderId },
                        data: { paymentStatus: "Paid" }
                    });
                }
            }
            return updatedOrder;
        });

        return response(200, true, "Delivery status updated successfully", transaction, null);
    } catch (error) {
        if (error.message === "INSUFFICIENT_BALANCE") {
            return response(400, false, "Author do not have enough balance in wallet to pay", null, null);
        }
        return response(500, false, "Error occurred while updating delivery status", null, error.message);
    }
}

const getMyOrders = async (vendorId) => {
    try {
        const myOrders = await prisma.printingOrder.findMany({ where: { vendorId } });
        return response(200, true, "My orders retrieved successfully", myOrders, null);
    } catch (error) {
        return response(500, false, "Error occurred while retrieving my orders", null, error);
    }
}
const getVendorDashboardData = async (vendorId) => {
    try {
        const [total, completed, pending, printing, earnings] = await Promise.all([
            prisma.printingOrder.count({ where: { vendorId } }),
            prisma.printingOrder.count({ where: { vendorId, deliveryStatus: "Delivered" } }),
            prisma.printingOrder.count({ where: { vendorId, printStatus: "Pending" } }),
            prisma.printingOrder.count({ where: { vendorId, deliveryStatus: "Printing" } }),
            prisma.wallet.findUnique({ where: { userId: vendorId } })
        ]);
        console.log(earnings)
        const dashboardData = {
            totalOrders: total,
            completedOrders: completed,
            pendingOrders: pending,
            printingOrders: printing,
            earnings: earnings?.totalBalance
        }
        return response(200, true, "Vendor dashboard data retrieved successfully", { dashboardData }, null);
    } catch (error) {
        return response(500, false, "Error occurred while retrieving vendor dashboard data", null, error);
    }
}
export {
    createPricing, getPricing, updateDeliveryStatus, updatePrintStatus, getMyOrders,
    getPendingOrders, getPrintDetail, getVendorDashboardData
}