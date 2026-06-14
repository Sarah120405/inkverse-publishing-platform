import prisma from "../../config/db.config.js";
import response from "../../utils/response.js";
import { removeFromCart } from "../Cart/cart.service.js";

const createOrder = async (bookId, userId, body) => {
    try {
        const book = await prisma.book.findUnique({ where: { id: bookId } })

        if (!book || !book.isPublished || !book.isActive) {
            return response(400, false, "Book not found", null, null)
        }
        const alreadyOrderd = await prisma.purchaseOrder.findFirst({
            where: { bookId, userId }
        })
        if (alreadyOrderd) {
            return response(400, false, "Book already Orderd", null, null);
        }
        let data = {
            bookId,
            userId,
            totalPrice: parseFloat(book.price) * body.quantity,
            quantity: body.quantity,
            paymentStatus: book.publishType === "ONLINE" ? "Paid" : "Pending"
        };
        if (book.publishType === "OFFLINE" && !body.shippingAddress) {
            return response(400, false, "Shipping Address is required");
        }
        if (body.shippingAddress) {
            data.shippingAddress = body.shippingAddress;
        }
        const user = await prisma.user.findUnique({ where: { id: userId } });
        let totalAmount = data.totalPrice, printingOrder = null;
        const transaction = await prisma.$transaction(async (tx) => {

            if (book.publishType === "OFFLINE") {

                if (user.role !== "Author") {
                    throw new Error('UNAUTHORIZED');
                }

                if (book.authorId !== userId) {
                    throw new Error('NOT_YOUR_BOOK');
                }
                const vendor = await tx.vendorProfile.findUnique({ where: { userId: body.vendorId } })
                if (!vendor) {
                    throw new Error("VENDOR_NOT_FOUND");
                }
                totalAmount = vendor.perPageCost * book.pages * body.copies;
                data.quantity = body.copies;
                data.totalPrice = totalAmount;
                if (body.advanceAmount < totalAmount * 0.1 || body.advanceAmount > totalAmount * 0.5) {
                    throw new Error("ADVANCE_AMOUNT_INVALID");
                }
                const authorWallet = await tx.wallet.findUnique({ where: { userId: userId } });

                if (!authorWallet || authorWallet.currentBalance < totalAmount) {
                    throw new Error("INSUFFICIENT_BALANCE");
                }

                printingOrder = await tx.printingOrder.create({
                    data: {
                        authorId: book.authorId,
                        vendorId: body.vendorId,
                        bookId: bookId,
                        copies: body.copies,
                        pages: book.pages,
                        shippingAddress: data.shippingAddress,
                        quotationAmount: totalAmount,
                        advanceAmount: body.advanceAmount,
                        remainingAmount: totalAmount - body.advanceAmount,
                        printStatus: "Pending",
                        deliveryStatus: "Pending"
                    }
                })
                if (!printingOrder) {
                    throw new Error("Printing Order creation failed");
                }
            }

            else {
                const admin = await tx.user.findFirst({ where: { role: "Admin" }, orderBy: { createdAt: "asc" } });
                if (!admin) throw new Error("Platform Admin not found");
                const setting = await prisma.setting.findUnique({ where: { key: "commission_rate" } });
                const commissionRate = setting ? parseFloat(setting.value) : 0.1;
                const commisionAmount = totalAmount * commissionRate;
                const authorAmount = totalAmount - commisionAmount;
                const updateAuthorWallet = await tx.wallet.update({
                    where: { userId: book.authorId },
                    data: {
                        totalBalance: { increment: authorAmount },
                        currentBalance: { increment: authorAmount }
                    }
                });
                const updateAdminWallet = await tx.wallet.update({
                    where: { userId: admin.id },
                    data: {
                        totalBalance: { increment: commisionAmount },
                        currentBalance: { increment: commisionAmount }
                    }
                });
            }

            let purchaseOrder = await tx.purchaseOrder.create({
                data: data
            });

            const payment = await tx.transaction.create({
                data: {
                    userId: userId,
                    purchaseOrderId: purchaseOrder.id,
                    transactionId: `TXN-${Date.now()}`,
                    amount: totalAmount,
                    paymentMethod: body.paymentMethod,
                    paymentStatus: data.paymentStatus,
                    ...(book.publishType === "OFFLINE" && { printingOrderId: printingOrder?.id })
                }
            });
            return { payment, purchaseOrder, ...(printingOrder && { printingOrder }) };

        })
        await removeFromCart(bookId, userId);
        return response(201, true, "Order successful", { transaction, book }, null)
    } catch (error) {

        if (error.message === 'UNAUTHORIZED') {
            return response(403, false, "Only Author can order offline books", null, null);
        }
        if (error.message === 'NOT_YOUR_BOOK') {
            return response(403, false, "You can only order printing for books you have written", null, null);
        }
        if (error.message === 'VENDOR_NOT_FOUND') {
            return response(404, false, "Vendor not found", null, null);
        }
        if (error.message === 'ADVANCE_AMOUNT_INVALID') {
            return response(400, false, "Advance amount should be between 10% to 50% of total amount", null, null);
        }
        if (error.message === 'INSUFFICIENT_BALANCE') {
            return response(400, false, "Insufficient Balance for payment", null, null);
        }
        if (error.message === "Platform Admin not found") {
            return response(404, false, "Platform Admin not found", null, null);
        }
        if (error.message === "Printing Order creation failed") {
            return response(500, false, "Printing Order creation failed", null, null);
        }
        return response(500, false, "Order Unsuccessful", null, error);
    }
}

const getMyOrder = async (id) => {
    try {
        const myOrder = await prisma.purchaseOrder.findMany({
            where: {
                userId: id
            },
            include: {
                transaction: true,
                orderBook: true,
            }
        });
        return response(200, true, "My Order retrieved succesfully", { myOrder }, null);
    } catch (error) {
        return response(500, false, "Order not retrieved", null, error)
    }
}

export { createOrder, getMyOrder };