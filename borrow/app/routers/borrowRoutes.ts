import express, { type Router } from "express";
import { validateRequest } from "app/middlewares/validator";
import { borrowRequestSchema } from "app/schemas";
import { verifyToken } from "app/middlewares/verifyToken";
import { verifyLibrarian } from "app/middlewares/verifyLibrarian";
import {
  fetchBorrowRequestCodes,
  fetchBorrowedBookCodes,
  fetchBorrowingHistory,
  fetchBorrowingInformation,
  issueBook,
  requestBook,
  returnBook,
} from "app/controllers/borrowController";

const borrowRouter: Router = express.Router();

borrowRouter.post(
  "/books/:bookId/borrow-request",
  verifyToken,
  validateRequest(borrowRequestSchema),
  requestBook
);
borrowRouter.get("/borrow-info", verifyToken, fetchBorrowingInformation);
borrowRouter.get("/borrow-history", verifyToken, fetchBorrowingHistory);
borrowRouter.get("/codes", verifyToken, verifyLibrarian, fetchBorrowRequestCodes);
borrowRouter.get(
  "/borrowed-codes",
  verifyToken,
  verifyLibrarian,
  fetchBorrowedBookCodes
);

borrowRouter.post(
  "/:borrowingId/issue-book",
  verifyToken,
  verifyLibrarian,
  issueBook
);
borrowRouter.post(
  "/:borrowingId/return-book",
  verifyToken,
  verifyLibrarian,
  returnBook
);

export { borrowRouter };
