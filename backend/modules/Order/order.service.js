import { Prisma } from "@prisma/client";
import prisma from "../../config/db.config.js";
import response from "../../utils/response.js";
import { createAuditLog } from "../../utils/auditLog.js";
import stripe from "../../config/stripe.config.js";
import { randomUUID } from "crypto";

const createOnlineOrder = async (items, userId) => {
  if (!Array.isArray(items) || items.length === 0) {
    return response(400, false, "At least one book is required");
  }

  const quantities = items.map((item) => Number(item.quantity));

  if (
    quantities.some(
      (quantity) => !Number.isSafeInteger(quantity) || quantity <= 0,
    )
  ) {
    return response(400, false, "Quantity must be a positive integer");
  }

  if (
    items.some(
      ({ book }) => !book || book.price === null || book.price === undefined,
    )
  ) {
    return response(400, false, "Book price is not configured");
  }

  const totalPrice = items.reduce(
    (total, item, index) =>
      total.plus(
        new Prisma.Decimal(item.book.price.toString()).mul(quantities[index]),
      ),
    new Prisma.Decimal(0),
  );

  if (totalPrice.lessThanOrEqualTo(0)) {
    return response(400, false, "Invalid payment amount");
  }

  const amountPaise = totalPrice.mul(100);

  if (
    !amountPaise.isInteger() ||
    !Number.isSafeInteger(amountPaise.toNumber())
  ) {
    return response(400, false, "Invalid payment amount");
  }
  // 1. Create a pending transaction in your database.
  const payment = await prisma.transaction.create({
    data: {
      userId,
      transactionId: `TXN-${randomUUID()}`,
      amount: totalPrice,
      paymentMethod: "Stripe",
      paymentStatus: "Pending",
      currency: "inr",
      checkoutOrders: {
        create: items.map((item, index) => ({
          userId,
          bookId: item.book.id,
          quantity: quantities[index],
          totalPrice: new Prisma.Decimal(item.book.price.toString()).mul(
            quantities[index],
          ),
          paymentStatus: "Pending",
        })),
      },
    },
    include: {
      checkoutOrders: true,
    },
  });

  // 2. Create the Stripe PaymentIntent.
  let paymentIntent;

  try {
    paymentIntent = await stripe.paymentIntents.create(
      {
        amount: amountPaise.toNumber(),
        currency: "inr",
        automatic_payment_methods: { enabled: true },
        metadata: {
          transactionId: payment.transactionId,
          userId,
        },
      },
      {
        idempotencyKey: `inkverse_order_${payment.transactionId}`,
      },
    );
    if (!paymentIntent.client_secret) {
      throw new Error("Stripe client secret unavailable");
    }
  } catch (error) {
    await prisma.$transaction([
      prisma.transaction.update({
        where: { id: payment.id },
        data: {
          paymentStatus: "Rejected",
          stripeStatus: "creation_failed",
        },
      }),

      prisma.purchaseOrder.updateMany({
        where: {
          checkoutTransactionId: payment.id,
          paymentStatus: "Pending",
        },
        data: {
          paymentStatus: "Rejected",
        },
      }),
    ]);

    throw error;
  }

  // 3. Save the PaymentIntent details and audit log.
  const updatedPayment = await prisma.$transaction(async (tx) => {
    const updated = await tx.transaction.update({
      where: { id: payment.id },
      data: {
        stripePaymentIntentId: paymentIntent.id,
        stripeStatus: paymentIntent.status,
      },
    });

    await createAuditLog(tx, {
      userId,
      action: "PAYMENT_TRANSACTION_CREATED",
      entityType: "Transaction",
      entityId: updated.id,
      oldValue: Prisma.JsonNull,
      newValue: {
        amount: updated.amount.toString(),
        paymentMethod: updated.paymentMethod,
        paymentStatus: updated.paymentStatus,
        stripePaymentIntentId: updated.stripePaymentIntentId,
      },
    });

    return updated;
  });

  // 4. Return the client secret to the frontend.
  if (!paymentIntent.client_secret) {
    throw new Error("Stripe client secret unavailable");
  }

  return response(
    200,
    true,
    "Payment initiated",
    {
      transaction: updatedPayment,
      clientSecret: paymentIntent.client_secret,
      items: items.map((item, index) => ({
        book: item.book,
        quantity: quantities[index],
      })),
      totalAmount: totalPrice.toString(),
    },
    null,
  );
};

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

const completeOnlineOrder = async (paymentIntent) => {
  const { transactionId, userId } = paymentIntent.metadata;

  if (paymentIntent.status !== "succeeded") {
    throw new Error("Payment has not succeeded");
  }

  if (!transactionId || !userId) {
    throw new Error("Invalid payment metadata");
  }

  // 2. Find the transaction
  const payment = await prisma.transaction.findUnique({
    where: { transactionId },
    include: {
      checkoutOrders: {
        include: {
          orderBook: true,
        },
      },
    },
  });

  if (!payment) {
    throw new Error("Transaction not found");
  }

  // 3. Verify that this PaymentIntent belongs to this transaction
  if (
    payment.userId !== userId ||
    payment.stripePaymentIntentId !== paymentIntent.id ||
    payment.paymentMethod !== "Stripe"
  ) {
    throw new Error("Payment verification failed");
  }

  if (payment.paymentStatus === "Paid") {
    return response(
      200,
      true,
      "Payment already processed",
      {
        alreadyProcessed: true,
        transactionId: payment.transactionId,
      },
      null,
    );
  }

  if (payment.paymentStatus !== "Pending") {
    throw new Error("Payment is not pending");
  }

  const orders = payment.checkoutOrders;

  if (!orders || orders.length === 0) {
    throw new Error("No purchase orders found for this transaction");
  }
  // 4. Validate amount and currency
  let expectedAmount = new Prisma.Decimal(0);
  for (const order of orders) {
    const book = order.orderBook;

    if (order.userId !== userId || order.paymentStatus !== "Pending" || !book) {
      throw new Error("Invalid or unavailable purchase order");
    }

    if (
      !Number.isSafeInteger(order.quantity) ||
      order.quantity <= 0 ||
      order.totalPrice.lessThanOrEqualTo(0)
    ) {
      throw new Error("Invalid purchase order details");
    }

    expectedAmount = expectedAmount.plus(order.totalPrice);
  }

  // 4. Verify amount and currency
  const expectedPaise = expectedAmount.mul(100);

  if (
    !expectedPaise.isInteger() ||
    !Number.isSafeInteger(expectedPaise.toNumber()) ||
    paymentIntent.currency !== "inr" ||
    paymentIntent.amount !== expectedPaise.toNumber() ||
    paymentIntent.amount_received !== expectedPaise.toNumber() ||
    !payment.amount.equals(expectedAmount)
  ) {
    throw new Error("Payment amount validation failed");
  }

  // 5. Perform all database updates atomically
  const result = await prisma.$transaction(async (tx) => {
    // Prevent duplicate wallet credits if Stripe retries the webhook
    const updatedPayment = await tx.transaction.updateMany({
      where: {
        id: payment.id,
        paymentStatus: "Pending",
        stripePaymentIntentId: paymentIntent.id,
      },
      data: {
        paymentStatus: "Paid",
        stripeStatus: paymentIntent.status,
      },
    });

    if (updatedPayment.count !== 1) {
      // Already processed or no longer pending
      return { alreadyProcessed: true };
    }

    // 6. Create the paid PurchaseOrder
    const updatedOrders = await tx.purchaseOrder.updateMany({
      where: {
        checkoutTransactionId: payment.id,
        userId,
        paymentStatus: "Pending",
      },
      data: {
        paymentStatus: "Paid",
      },
    });

    if (updatedOrders.count !== orders.length) {
      throw new Error("Failed to update all purchase orders");
    }

    const admin = await tx.user.findFirst({
      where: { role: "Admin" },
      select: { id: true },
    });

    if (!admin) {
      throw new Error("Admin account not found");
    }
    // 8. Retrieve commission rate
    const commissionSetting = await tx.setting.findUnique({
      where: { key: "commission_rate" },
    });

    const commissionRate = new Prisma.Decimal(
      commissionSetting ? commissionSetting.value : "0.1",
    );

    if (commissionRate.lessThan(0) || commissionRate.greaterThan(1)) {
      throw new Error("Invalid commission rate");
    }

    const authorEarnings = new Map();
    let totalCommission = new Prisma.Decimal(0);

    for (const order of orders) {
      const authorId = order.orderBook.authorId;

      const commission = order.totalPrice.mul(commissionRate);
      const authorAmount = order.totalPrice.minus(commission);

      totalCommission = totalCommission.plus(commission);

      const existingAmount =
        authorEarnings.get(authorId) || new Prisma.Decimal(0);

      authorEarnings.set(authorId, existingAmount.plus(authorAmount));

      // Audit log for each PurchaseOrder
      await createAuditLog(tx, {
        userId,
        action: "ONLINE_ORDER_CREATED",
        entityType: "PurchaseOrder",
        entityId: order.id,
        oldValue: {
          paymentStatus: "Pending",
        },
        newValue: {
          bookId: order.bookId,
          quantity: order.quantity,
          totalPrice: order.totalPrice.toString(),
          paymentStatus: "Paid",
        },
      });
    }

    // 9. Credit each author's wallet
    for (const [authorId, authorAmount] of authorEarnings) {
      const authorWallet = await tx.wallet.findUnique({
        where: { userId: authorId },
      });

      if (!authorWallet) {
        throw new Error(`Wallet not found for author ${authorId}`);
      }

      const updatedWallet = await tx.wallet.update({
        where: { userId: authorId },
        data: {
          totalBalance: { increment: authorAmount },
          currentBalance: { increment: authorAmount },
        },
      });

      await createAuditLog(tx, {
        userId: authorId,
        action: "AUTHOR_WALLET_CREDITED",
        entityType: "Wallet",
        entityId: authorWallet.id,
        oldValue: {
          totalBalance: authorWallet.totalBalance.toString(),
          currentBalance: authorWallet.currentBalance.toString(),
        },
        newValue: {
          totalBalance: updatedWallet.totalBalance.toString(),
          currentBalance: updatedWallet.currentBalance.toString(),
          amount: authorAmount.toString(),
          sourceTransactionId: payment.transactionId,
        },
      });
    }

    // 10. Credit Admin's wallet with total commission
    const adminWallet = await tx.wallet.findUnique({
      where: { userId: admin.id },
    });

    if (!adminWallet) {
      throw new Error("Admin wallet not found");
    }

    const updatedAdminWallet = await tx.wallet.update({
      where: { userId: admin.id },
      data: {
        totalBalance: { increment: totalCommission },
        currentBalance: { increment: totalCommission },
      },
    });

    await createAuditLog(tx, {
      userId: admin.id,
      action: "ADMIN_COMMISSION_CREDITED",
      entityType: "Wallet",
      entityId: adminWallet.id,
      oldValue: {
        totalBalance: adminWallet.totalBalance.toString(),
        currentBalance: adminWallet.currentBalance.toString(),
      },
      newValue: {
        totalBalance: updatedAdminWallet.totalBalance.toString(),
        currentBalance: updatedAdminWallet.currentBalance.toString(),
        amount: totalCommission.toString(),
        sourceTransactionId: payment.transactionId,
      },
    });

    // 11. Remove all purchased books from this user's cart
    await tx.cart.deleteMany({
      where: {
        userId,
        bookId: {
          in: orders.map((order) => order.bookId),
        },
      },
    });

    return {
      alreadyProcessed: false,
      transactionId: payment.transactionId,
      purchaseOrders: orders.map((order) => ({
        ...order,
        paymentStatus: "Paid",
      })),
      totalAmount: expectedAmount.toString(),
      totalCommission: totalCommission.toString(),
      authorEarnings: Object.fromEntries(
        [...authorEarnings].map(([authorId, amount]) => [
          authorId,
          amount.toString(),
        ]),
      ),
    };
  });
  if (result.alreadyProcessed) {
    return response(200, true, "Payment already processed", result, null);
  }

  return response(201, true, "Order successful", result, null);
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

export { createOrder, getMyOrder, completeOnlineOrder };
