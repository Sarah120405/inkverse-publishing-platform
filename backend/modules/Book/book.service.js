import prisma from "../../config/db.config.js";
import response from "../../utils/response.js";
import cloudinary from "../../config/cloud.config.js";

const createBook = async (bookData, authorId) => {
    try {
        const { coverImg, thumbnailImg } = bookData;
        const coverImgUrl = await cloudinary.uploader.upload(coverImg, { folder: 'books' });
        const thumbnailImgUrl = await cloudinary.uploader.upload(thumbnailImg, { folder: 'books' });
        const book = await prisma.book.create({
            data: {
                ...bookData, authorId,
                coverImg: coverImgUrl.secure_url,
                thumbnailImg: thumbnailImgUrl.secure_url
            },
        });
        return response(201, true, "Book created successfully", book, null);
    } catch (error) {
        return response(500, false, "Internal server error", null, error.message);
    }
};

const updateBook = async (authorId, bookId, bookData) => {
    try {
        const book = await prisma.book.findUnique({
            where: { id: bookId }
        })
        if (!book) {
            return response(404, false, "Book not found", null, null);
        }
        if (book.authorId !== authorId) {
            return response(403, false, "Forbidden", null, null);
        }
        if (bookData.coverImg) {
            const coverImgUrl = await cloudinary.uploader.upload(bookData.coverImg, { folder: 'books' });
            bookData.coverImg = coverImgUrl.secure_url;
        }
        if (bookData.thumbnailImg) {
            const thumbnailImgUrl = await cloudinary.uploader.upload(bookData.thumbnailImg, { folder: 'books' });
            bookData.thumbnailImg = thumbnailImgUrl.secure_url;
        }
        const bookUpdate = await prisma.book.update({
            where: {
                id: bookId
            },
            data: { ...bookData }
        });
        return response(200, true, "Book updated successfully", bookUpdate, null);
    } catch (error) {
        return response(500, false, "Internal server error", null, error.message);
    }
}

const deleteBook = async (authorId, bookId) => {
    try {
        const book = await prisma.book.findUnique({
            where: { id: bookId }
        })
        if (!book) {
            return response(404, false, "Book not found", null, null);
        }
        if (book.authorId !== authorId) {
            return response(403, false, "Forbidden", null, null);
        }
        const bookDelete = await prisma.book.delete({
            where: {
                id: bookId
            }
        });
        return response(200, true, "Book deleted successfully", bookDelete, null);
    } catch (error) {
        return response(500, false, "Internal server error", null, error.message);
    }
}

const getMyBooks = async (authorId, page, limit) => {
    try {
        const skip = page == 1 ? 0 : (page - 1) * limit;
        const books = await prisma.book.findMany({
            where: {
                authorId: authorId
            },
            skip: skip,
            take: parseInt(limit)
        });
        const count = await prisma.book.count({
            where: {
                authorId: authorId
            }
        })
        const pagination = {
            page: parseInt(page),
            limit: parseInt(limit),
            totalItems: count,
            totalPages: Math.ceil(count / parseInt(limit)),
            hasNextPage: parseInt(page) < Math.ceil(count / parseInt(limit)),
            hasPrevPage: parseInt(page) > 1
        }
        if (books.length === 0) {
            return response(404, false, "No books found for this author", null, null);
        }
        return response(200, true, "Books retrieved successfully", { books, pagination }, null);
    } catch (error) {
        return response(500, false, "Internal server error", null, error.message);
    }
}

const publishBook = async (authorId, bookId, bookData) => {
    try {
        const book = await prisma.book.findUnique({
            where: { id: bookId }
        });
        if (!book) {
            return response(404, false, "Book not found", null, null);
        }
        if (book.authorId !== authorId) {
            return response(403, false, "Forbidden", null, null);
        }
        if (book.isPublished) {
            return response(400, false, "Book is already published", null, null);
        }
        const bookPublish = await prisma.book.update({
            where: {
                id: bookId,
            },
            data: { ...bookData, isPublished: true, publishedAt: new Date() }
        });
        return response(200, true, "Book published successfully", bookPublish, null);
    } catch (error) {
        return response(500, false, "Internal server error", null, error.message);
    }
}

const getPublishedBooks = async (page, limit, search, category, minPrice, maxPrice, rating, sort, format, pages) => {
    try {
        const skip = page == 1 ? 0 : (page - 1) * limit;
        const whereClause = {
            isPublished: true
        };
        if (search) whereClause.title = { contains: search, mode: "insensitive" };
        if (category && category !== "All Books") whereClause.category = { contains: category, mode: "insensitive" };

        if (minPrice || maxPrice) {
            whereClause.price = {};
            if (minPrice) {
                whereClause.price.gte = parseFloat(minPrice)
            }
            if (maxPrice) {
                whereClause.price.lte = parseFloat(maxPrice)
            }
        }

        if (format === "Hardcover" || format === "Paperback") {
            whereClause.publishType = "OFFLINE"
        } else if (format === "Audiobook" || format === "E-book") {
            whereClause.publishType = "ONLINE"
        }
        else {
            delete whereClause.publishType;
        }
        if (pages === "quick") {
            whereClause.pages = { gte: 0, lte: 150 }
        }
        else if (pages === "standard") {
            whereClause.pages = { gte: 150, lte: 300 }
        }
        else if (pages === "epic") {
            whereClause.pages = { gte: 300, lte: 500 }
        }
        else if (pages === "legendary") {
            whereClause.pages = { gte: 500, lte: 700 }
        }
        else {
            delete whereClause.pages;
        }
        if (rating) {
            whereClause.reviews = {
                some: {
                    rating: { gte: parseFloat(rating) }
                }
            }
        }


        const orderBy = sort === "Newest" || sort === "newest" ? "desc" : "asc";
        const books = await prisma.book.findMany({
            where: whereClause,
            orderBy: {
                publishedAt: orderBy
            },
            include: {
                author: true,
                reviews: true
            },
            skip: skip,
            take: parseInt(limit)
        });

        const count = await prisma.book.count({
            where: whereClause
        });

        const pagination = {
            page: parseInt(page),
            limit: parseInt(limit),
            totalItems: count,
            currentPageItems: books.length,
            totalPages: Math.ceil(count / parseInt(limit)),
            hasNextPage: parseInt(page) < Math.ceil(count / parseInt(limit)),
            hasPrevPage: parseInt(page) > 1
        }
        if (books.length === 0) {
            return response(404, false, "No books found", null, null);
        }
        return response(200, true, "Books retrieved successfully", { books, pagination }, null);

    }
    catch (err) {
        return response(500, false, "Internal server error", null, err.message);
    }
}
const getPublishedBookById = async (bookId) => {
    try {
        const book = await prisma.book.findUnique({
            where: { id: bookId },
            include: {
                author: true,
                reviews: true
            }
        });
        if (!book) {
            return response(404, false, "Book not found", null, null);
        }
        const recommendedBooks = await prisma.book.findMany({
            where: {
                category: book.category,
                isPublished: true,
                id: {
                    not: bookId
                }
            },
            include: {
                author: true,
                reviews: true
            }
        });
        return response(200, true, "Book retrieved successfully", { book, recommendedBooks }, null);
    } catch (error) {
        return response(500, false, "Internal server error", null, error.message);
    }
}
const addReview = async (userId, bookId, reviewData) => {
    try {
        const book = await prisma.book.findUnique({
            where: { id: bookId }
        });
        if (!book) {
            return response(404, false, "Book not found", null, null);
        }
        if (!book.isPublished) {
            return response(400, false, "Book is not published", null, null);
        }
        const review = await prisma.review.create({
            data: {
                ...reviewData, userId, bookId
            }
        });
        return response(200, true, "Review added successfully", review, null);
    } catch (error) {
        return response(500, false, "Internal server error", null, error.message);
    }
}

const readingProgress = async (userId, bookId, progressData) => {
    try {

        const book = await prisma.book.findUnique({
            where: { id: bookId }
        })

        if (!book) {
            return response(404, false, "Book not found", null, null);
        }

        const purchase = await prisma.purchaseOrder.findFirst({
            where: {
                userId: userId,
                bookId: bookId
            }
        })

        if (!purchase) {
            return response(404, false, "You have not purchased this book", null, null);
        }

        if (!book.pages || book.pages < 1) {
            return response(400, false, "This book has no page count", null, null);
        }

        const { currentPage } = progressData;

        if (currentPage > book.pages) {
            return response(400, false, "Current page exceeds book pages", null, null);
        }
        const progressPercentage = Math.floor((currentPage / book.pages) * 100);
        const readingStatus = progressPercentage === 100 ? 'Completed' : progressPercentage === 0 ? 'NotStarted' : 'InProgress';
        const progress = await prisma.readingProgress.upsert({
            where: {
                userId_bookId: {
                    userId: userId,
                    bookId: bookId
                }
            },
            update: {
                currentPage,
                readingStatus,
                progressPercentage,
                lastReadAt: new Date()
            },
            create: {
                currentPage,
                readingStatus,
                progressPercentage,
                userId: userId,
                bookId: bookId,
                lastReadAt: new Date()
            }
        });

        return response(200, true, 'Reading Progress Updated successfully', progress, null)
    } catch (error) {
        return response(500, false, "Internal server error", null, error.message);
    }
}

const getReadingProgress = async (userId) => {

    try {
        const readingProgress = await prisma.readingProgress.findMany({
            where: {
                userId: userId
            }
        })
        return response(200, true, 'Reading progress fetched', readingProgress, null)
    } catch (error) {
        return response(500, false, "Internal server error", null, error.message);
    }
}

export {
    createBook, updateBook, deleteBook, getMyBooks, publishBook, getPublishedBookById,
    getPublishedBooks, addReview, readingProgress, getReadingProgress
};