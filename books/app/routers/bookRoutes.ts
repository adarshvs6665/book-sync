import express, { type Router } from "express";
import { validateRequest } from "app/middlewares/validator";
import {
  bulkCreateBooksSchema,
  createBookSchema,
  updateBookSchema,
} from "app/schemas";
import {
  bulkCreateBooks,
  createBook,
  deleteBook,
  fetchBooks,
  updateBook,
} from "app/controllers/bookController";
import { verifyToken } from "app/middlewares/verifyToken";
import { verifyLibrarian } from "app/middlewares/verifyLibrarian";

const bookRouter: Router = express.Router();

bookRouter.post(
  "/",
  verifyToken,
  verifyLibrarian,
  validateRequest(createBookSchema),
  createBook
);
bookRouter.put(
  "/:bookId",
  verifyToken,
  verifyLibrarian,
  validateRequest(updateBookSchema),
  updateBook
);
bookRouter.post(
  "/bulk-create",
  verifyToken,
  verifyLibrarian,
  validateRequest(bulkCreateBooksSchema),
  bulkCreateBooks
);
bookRouter.get("/", verifyToken, fetchBooks);
bookRouter.delete("/:bookId", verifyToken , verifyLibrarian , deleteBook);

export { bookRouter };
