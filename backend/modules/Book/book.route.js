import express from "express";
import {
    createBookController, updateBookController, deleteBookController, getMyBooksController,
    publishBookController, getPublishedBooksController, addReviewController, readingProgressController,
    getReadingProgressController, getPublishedBookByIdController
} from "./book.controller.js";
import { authorize } from "../../middleware/auth.roleAccess.js";
import localFileUpload from "../../middleware/local.fileUpload.js";

const route = express.Router();
route.post('/create', authorize(['Author']), localFileUpload.fields([
    { name: 'coverImg', maxCount: 1 },
    { name: 'thumbnailImg', maxCount: 1 }]), createBookController);

route.put('/update/:bookId', authorize(['Author']), localFileUpload.fields([
    { name: 'coverImg', maxCount: 1 },
    { name: 'thumbnailImg', maxCount: 1 }]), updateBookController);

route.delete('/delete/:bookId', authorize(['Author']), deleteBookController);

route.get('/my-books', authorize(['Author', 'Admin']), getMyBooksController);

route.patch('/publish/:bookId', authorize(['Author']), publishBookController);
route.get('/published-books', authorize(['Reader', 'Author', 'Admin']), getPublishedBooksController);
route.get('/published-books/:bookId', authorize(['Reader', 'Author', 'Admin']), getPublishedBookByIdController)

route.post('/reviews/:bookId', authorize(['Reader']), addReviewController);

route.post('/reading-progress/:bookId', authorize(['Reader']), readingProgressController);
route.get('/reading-progress', authorize(['Reader']), getReadingProgressController);

export default route;
