import prisma from "../../config/db.config.js";
import response from "../../utils/response.js";

const addToCart = async (bookId, userId) => {
    try {

        const book = await prisma.book.findUnique({
            where: {
                id: bookId
            }
        });


        if (!book || !book.isActive || !book.isPublished) {
            console.log(book);
            return response(404, false, "Book does not exist", null, null);
        }
        if (book.publishType === "OFFLINE") {
            return response(404, false, "Book not available Online", book, null);
        }
        const addedBook = await prisma.cart.findUnique({
            where: {
                userId_bookId: {
                    bookId,
                    userId
                }
            }
        });
        if (addedBook) {
            return response(400, false, "Already present in cart", addedBook, null);
        }
        const alreadyPurchased = await prisma.purchaseOrder.findFirst({
            where: { bookId, userId }
        })
        if (alreadyPurchased) {
            return response(400, false, "You have already purchased this book", null, null);
        }
        const cart = await prisma.cart.create({
            data: {
                bookId,
                userId
            }
        });
        return response(200, true, "Added to cart", cart, null);
    } catch (error) {
        return response(500, false, "Not added to cart", null, error.message);
    }
}

const removeFromCart = async (bookId, userId) => {
    try {
        const remove = await prisma.cart.delete({
            where: {
                userId_bookId: {
                    bookId,
                    userId
                }
            }
        })
        return response(200, true, "Remove from Cart", remove, null);
    } catch (error) {
        return response(500, false, "Not removed", null, error);
    }
}

const getMyCart = async (userId) => {
    try {
        const cart = await prisma.cart.findMany({
            where: {
                userId
            },
            include: {
                addedBook: {
                    include: {
                        author: true
                    }
                }
            }
        })
        if (cart.length === 0) {
            return response(200, false, "Cart Empty", null, null);
        }
        return response(200, true, "Cart retrieved Succesfully", cart, null);
    } catch (error) {
        return response(500, false, "Cart not found", null, error);
    }
}

const clearCart = async (userId) => {
    try {
        const remove = await prisma.cart.deleteMany({
            where: { userId }
        });
        return response(200, true, "Cart cleared Succesfully", remove, null);
    } catch (error) {
        return response(500, false, "Cart not found", null, error);
    }
}
export { addToCart, removeFromCart, getMyCart, clearCart };