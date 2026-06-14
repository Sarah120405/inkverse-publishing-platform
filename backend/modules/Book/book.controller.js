import {
    createBook, updateBook, deleteBook, getMyBooks, publishBook, getPublishedBookById,
    getPublishedBooks, addReview, getReadingProgress, readingProgress
} from "./book.service.js";
import { bookSchema, updateBookSchema, publishBookSchema, reviewSchema, readingProgressSchema } from "./book.validator.js";

const createBookController = async (req, res) => {

    const { error } = bookSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    if (!req.files || !req.files['coverImg'] || !req.files['thumbnailImg']) {
        return res.status(400).json({
            success: false,
            message: "Both Cover Image and Thumbnail are required"
        });
    }
    req.body.coverImg = req.files['coverImg'][0].path;
    req.body.thumbnailImg = req.files['thumbnailImg'][0].path;
    const book = await createBook(req.body, req.user.id);
    res.status(book.status).json(book);
};

const updateBookController = async (req, res) => {
    const { error } = updateBookSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    if (req.files && req.files['coverImg']) {
        req.body.coverImg = req.files['coverImg'][0].path;
    }
    if (req.files && req.files['thumbnailImg']) {
        req.body.thumbnailImg = req.files['thumbnailImg'][0].path;
    }
    const { authorId, bookId, ...bookData } = { ...req.body, authorId: req.user.id, bookId: req.params.bookId };
    const book = await updateBook(authorId, bookId, bookData);
    res.status(book.status).json(book);
}

const deleteBookController = async (req, res) => {
    const { authorId, bookId } = { authorId: req.user.id, bookId: req.params.bookId };
    const book = await deleteBook(authorId, bookId);
    res.status(book.status).json(book);
}

const getMyBooksController = async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const books = await getMyBooks(req.user.id, page, limit);
    res.status(books.status).json(books);
}
const publishBookController = async (req, res) => {
    const { error } = publishBookSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    const { authorId, bookId, ...bookData } = { ...req.body, authorId: req.user.id, bookId: req.params.bookId };
    const book = await publishBook(authorId, bookId, bookData);
    res.status(book.status).json(book);
}

const getPublishedBooksController = async (req, res) => {
    const { page = 1, limit = 10, search, category, minPrice, maxPrice, rating, sort, format, pages } = req.query;
    const book = await getPublishedBooks(page, limit, search, category, minPrice, maxPrice, rating, sort, format, pages);
    res.status(book.status).json(book);
}

const getPublishedBookByIdController = async (req, res) => {
    const { bookId } = { bookId: req.params.bookId };
    const book = await getPublishedBookById(bookId);
    res.status(book.status).json(book);
}

const addReviewController = async (req, res) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    const { bookId, ...reviewData } = { ...req.body, bookId: req.params.bookId };
    const review = await addReview(req.user.id, bookId, reviewData);
    res.status(review.status).json(review);
}

const readingProgressController = async (req, res) => {

    const { error } = readingProgressSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    const { bookId, ...progressData } = { ...req.body, bookId: req.params.bookId };
    const progress = await readingProgress(req.user.id, bookId, progressData);
    res.status(progress.status).json(progress);
}

const getReadingProgressController = async (req, res) => {

    const readingProgress = await getReadingProgress(req.user.id)
    res.status(readingProgress.status).json(readingProgress);
}

export {
    createBookController, updateBookController, deleteBookController,
    getMyBooksController, publishBookController, getPublishedBooksController,
    addReviewController, readingProgressController, getReadingProgressController, getPublishedBookByIdController
};