/* import { Prisma } from "@prisma/client"; */
import prisma from "../../config/db.config.js";
import response from "../../utils/response.js";
/* import { createAuditLog } from "../../utils/auditLog.js";
import stripe from "../../config/stripe.config.js";
import { randomUUID } from "crypto"; */
import createOnlineOrder from "./Services/createOnlineOrder.service.js";

const createOrder = async (books, userId) => {
  try {
    if (!Array.isArray(books) || books.length === 0) {
      return response(400, false, "No books selected", null, null);
    }

    // 2. Validate book IDs and quantities
    const invalidItem = books.find(
      (item) =>
        !item.bookId ||
        !Number.isInteger(item.quantity ?? 1) ||
        (item.quantity ?? 1) < 1,
    );

    if (invalidItem) {
      return response(400, false, "Invalid book ID or quantity", null, null);
    }

    // Prevent duplicate book entries in the same order
    const bookIds = books.map((item) => item.bookId);

    if (new Set(bookIds).size !== bookIds.length) {
      return response(400, false, "Duplicate books found", null, null);
    }

    // 3. Find user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return response(404, false, "User not found", null, null);
    }

    // 4. Fetch all requested books
    const existingBooks = await prisma.book.findMany({
      where: {
        id: { in: bookIds },
      },
    });

    // Check whether all requested books exist
    if (existingBooks.length !== bookIds.length) {
      return response(400, false, "One or more books not found", null, null);
    }

    // Map books by ID for easy lookup
    const bookMap = new Map(existingBooks.map((book) => [book.id, book]));

    // 5. Validate each book
    for (const item of books) {
      const book = bookMap.get(item.bookId);

      if (!book.isPublished || !book.isActive) {
        return response(400, false, `${book.title} is unavailable`, null, null);
      }

      if (book.publishType !== "ONLINE" || book.price === null) {
        return response(
          400,
          false,
          `${book.title} is not available for online purchase`,
          null,
          null,
        );
      }
    }

    // 6. Check whether any book was already purchased
    const alreadyOrdered = await prisma.purchaseOrder.findFirst({
      where: {
        userId,
        paymentStatus: "Paid",
        bookId: { in: bookIds },
      },
      include: {
        orderBook: {
          select: { title: true },
        },
      },
    });

    if (alreadyOrdered) {
      return response(
        400,
        false,
        `${alreadyOrdered.orderBook.title} already purchased`,
        null,
        null,
      );
    }

    // 7. Prepare items for Stripe checkout
    const orderItems = books.map((item) => ({
      book: bookMap.get(item.bookId),
      quantity: item.quantity ?? 1,
    }));

    return await createOnlineOrder(orderItems, userId);

    /*  if (book.publishType === "OFFLINE") {
      return await createOfflineOrder(book, bookId, userId, body);
    } */
  } catch (error) {
    console.error("Create order error:", error);
    return response(500, false, "Order unsuccessful", null, error);
  }
};

/* const createOrder = async (bookId, userId, body) => {
  try {
    const book = await prisma.book.findUnique({ where: { id: bookId } });

    if (!book || !book.isPublished || !book.isActive) {
      return response(400, false, "Book not found", null, null);
    }
    const alreadyOrderd = await prisma.purchaseOrder.findFirst({
      where: { bookId, userId },
    });
    if (alreadyOrderd) {
      return response(400, false, "Book already Orderd", null, null);
    }
    const quantity = new Prisma.Decimal(body.quantity);
    const bookPrice = new Prisma.Decimal(book.price.toString());

    let data = {
      bookId,
      userId,
      totalPrice: bookPrice.mul(quantity),
      quantity: quantity,
      paymentStatus: book.publishType === "ONLINE" ? "Paid" : "Pending",
    };
    if (book.publishType === "OFFLINE" && !body.shippingAddress) {
      return response(400, false, "Shipping Address is required");
    }
    if (body.shippingAddress) {
      data.shippingAddress = body.shippingAddress;
    }
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return response(404, false, "User not found", null, null);
    }
    let printingOrder = null;
    const transaction = await prisma.$transaction(async (tx) => {
       if (book.publishType === "OFFLINE") {
        if (user.role !== "Author") {
          throw new Error("UNAUTHORIZED");
        }

        if (book.authorId !== userId) {
          throw new Error("NOT_YOUR_BOOK");
        }
        const vendor = await tx.vendorProfile.findUnique({
          where: { userId: body.vendorId },
        });
        if (!vendor) {
          throw new Error("VENDOR_NOT_FOUND");
        }
        totalAmount = new Prisma.Decimal(vendor.perPageCost)
          .mul(book.pages)
          .mul(body.copies);
        data.quantity = new Prisma.Decimal(body.copies);
        data.totalPrice = totalAmount;
        const advanceAmount = new Prisma.Decimal(body.advanceAmount.toString());
        const remainingAmount = totalAmount.minus(advanceAmount);
        if (
          advanceAmount.lessThan(totalAmount.mul(0.1)) ||
          advanceAmount.greaterThan(totalAmount.mul(0.5))
        ) {
          throw new Error("ADVANCE_AMOUNT_INVALID");
        }
        const authorWallet = await tx.wallet.findUnique({
          where: { userId: userId },
        });

        if (
          !authorWallet ||
          authorWallet.currentBalance.lessThan(totalAmount)
        ) {
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
            advanceAmount: advanceAmount,
            remainingAmount: remainingAmount,
            printStatus: "Pending",
            deliveryStatus: "Pending",
          },
        });
        if (!printingOrder) {
          throw new Error("Printing Order creation failed");
        }
        await createAuditLog(tx, {
          userId,
          action: "PRINTING_ORDER_CREATED",
          entityType: "PrintingOrder",
          entityId: printingOrder.id,
          oldValue: Prisma.JsonNull,
          newValue: {
            quotationAmount: printingOrder.quotationAmount.toString(),
            advanceAmount: printingOrder.advanceAmount.toString(),
            remainingAmount: printingOrder.remainingAmount.toString(),
            printStatus: printingOrder.printStatus,
            deliveryStatus: printingOrder.deliveryStatus,
          },
        });
      }  
      if (book.publishType === "ONLINE") {
        const onlineOrder = await createOnlineOrder(book, bookId, userId, body);

        const admin = await tx.user.findFirst({
          where: { role: "Admin" },
          orderBy: { createdAt: "asc" },
        });
        if (!admin) throw new Error("Platform Admin not found");
        const setting = await tx.setting.findUnique({
          where: { key: "commission_rate" },
        });
        const commissionRate = new Prisma.Decimal(
          setting ? setting.value : 0.1,
        );
        const commisionAmount = onlineOrder.totalPrice.mul(commissionRate);
        const authorAmount = onlineOrder.totalPrice.minus(commisionAmount);

        const updateAuthorWallet = await tx.wallet.update({
          where: { userId: book.authorId },
          data: {
            totalBalance: { increment: authorAmount },
            currentBalance: { increment: authorAmount },
          },
        });
        const updateAdminWallet = await tx.wallet.update({
          where: { userId: admin.id },
          data: {
            totalBalance: { increment: commisionAmount },
            currentBalance: { increment: commisionAmount },
          },
        });
        console.log("Author Wallet Updated:", updateAuthorWallet);
        await createAuditLog(tx, {
          userId: userId,
          action: "AUTHOR_WALLET_CREDITED",
          entityType: "Wallet",
          entityId: updateAuthorWallet.id,
          oldValue: {
            totalBalance: updateAuthorWallet.totalBalance
              .minus(authorAmount)
              .toString(),
            currentBalance: updateAuthorWallet.currentBalance
              .minus(authorAmount)
              .toString(),
          },
          newValue: {
            totalBalance: updateAuthorWallet.totalBalance.toString(),
            currentBalance: updateAuthorWallet.currentBalance.toString(),
          },
        });
        await createAuditLog(tx, {
          userId,
          action: "ADMIN_WALLET_CREDITED",
          entityType: "Wallet",
          entityId: updateAdminWallet.id,
          oldValue: {
            totalBalance: updateAdminWallet.totalBalance
              .minus(commisionAmount)
              .toString(),
            currentBalance: updateAdminWallet.currentBalance
              .minus(commisionAmount)
              .toString(),
          },
          newValue: {
            totalBalance: updateAdminWallet.totalBalance.toString(),
            currentBalance: updateAdminWallet.currentBalance.toString(),
          },
        });
      }

      return {
        payment: onlineOrder.transaction,
        purchaseOrder: onlineOrder.purchaseOrder,
        ...(printingOrder && { printingOrder }),
      };
    });
    await removeFromCart(bookId, userId);
    return response(201, true, "Order successful", { transaction, book }, null);
  } catch (error) {
    if (error.message === "UNAUTHORIZED") {
      return response(
        403,
        false,
        "Only Author can order offline books",
        null,
        null,
      );
    }
    if (error.message === "NOT_YOUR_BOOK") {
      return response(
        403,
        false,
        "You can only order printing for books you have written",
        null,
        null,
      );
    }
    if (error.message === "VENDOR_NOT_FOUND") {
      return response(404, false, "Vendor not found", null, null);
    }
    if (error.message === "ADVANCE_AMOUNT_INVALID") {
      return response(
        400,
        false,
        "Advance amount should be between 10% to 50% of total amount",
        null,
        null,
      );
    }
    if (error.message === "INSUFFICIENT_BALANCE") {
      return response(
        400,
        false,
        "Insufficient Balance for payment",
        null,
        null,
      );
    }
    if (error.message === "Platform Admin not found") {
      return response(404, false, "Platform Admin not found", null, null);
    }
    if (error.message === "Printing Order creation failed") {
      return response(500, false, "Printing Order creation failed", null, null);
    }
    return response(500, false, "Order Unsuccessful", null, error);
  }
}; */

const getMyOrder = async (id) => {
  try {
    const myOrder = await prisma.purchaseOrder.findMany({
      where: {
        userId: id,
      },
      include: {
        transaction: true,
        orderBook: true,
      },
    });
    return response(
      200,
      true,
      "My Order retrieved succesfully",
      { myOrder },
      null,
    );
  } catch (error) {
    return response(500, false, "Order not retrieved", null, error);
  }
};

export { createOrder, getMyOrder };
