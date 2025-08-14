import { ResponseHelper } from "app/utils/ResponseHelper.js";
import { StatusCodes } from "http-status-codes";
import { Request, Response } from "express";
import { Book, IBook } from "app/models/Book";
import { IUser } from "app/models/User";
import { Borrowing } from "app/models/Borrowing";
import { BorrowingStatus } from "app/enums";
import { DateUtil } from "app/utils/DateUtil";
import config from "config";
import { tracer } from "app/monitoring";

export const requestBook = async (req: Request, res: Response) => {
  const span = tracer.startSpan("requestBook");

  try {
    const user: IUser = res.locals.user;
    const { bookId } = req.params;
    const book = await Book.findOne({ bookId }).lean();

    if (!book) {
      span.addEvent("Book not found");

      return ResponseHelper.handleError(
        res,
        "Book not found",
        undefined,
        StatusCodes.NOT_FOUND
      );
    }

    if (book.totalCopies === 0) {
      span.addEvent("No more copies");

      return ResponseHelper.handleError(
        res,
        "No more copies",
        undefined,
        StatusCodes.CONFLICT
      );
    }

    const borrowing = await Borrowing.create({
      userId: user.userId,
      bookId: book.bookId,
    });

    span.addEvent(
      `Borrow request for book with id ${bookId} made successfully`
    );

    await Book.updateOne({ bookId }, { totalCopies: book.totalCopies - 1 });

    ResponseHelper.handleSuccess(
      res,
      "Request made successfully",
      undefined,
      StatusCodes.CREATED
    );
  } catch (error) {
    console.log(error);
    span.addEvent("Requesting book failed");

    return ResponseHelper.handleError(res, "Requesting book failed");
  }
};

export const fetchBorrowingInformation = async (
  req: Request,
  res: Response
) => {
  const span = tracer.startSpan("fetchBorrowingInformation");

  try {
    const user: IUser = res.locals.user;
    const books = await Book.find().lean();
    let borrowings = await Borrowing.find({
      userId: user.userId,
      status: { $ne: BorrowingStatus.RETURNED },
    }).lean();

    borrowings = borrowings.map((item) => {
      return {
        ...item,
        bookInfo: books.find((e) => e.bookId === item.bookId),
      };
    });

    span.addEvent("Borrowing information fetched successfully");

    ResponseHelper.handleSuccess(
      res,
      "Borrowing information fetched successfully",
      {
        borrowInfo: borrowings,
      },
      StatusCodes.OK
    );
  } catch (error) {
    console.log(error);
    span.addEvent("Failed to fetch borrowing information");

    return ResponseHelper.handleError(
      res,
      "Failed to fetch borrowing information"
    );
  }
};

export const fetchBorrowingHistory = async (req: Request, res: Response) => {
  const span = tracer.startSpan("fetchBorrowingHistory");

  try {
    const user: IUser = res.locals.user;
    const books = await Book.find().lean();
    let borrowings = await Borrowing.find({
      userId: user.userId,
    })
      .sort({ createdAt: -1 })
      .lean();

    borrowings = borrowings.map((item) => {
      return {
        ...item,
        bookInfo: books.find((e) => e.bookId === item.bookId),
      };
    });

    span.addEvent("History fetched successfully");

    ResponseHelper.handleSuccess(
      res,
      "History fetched successfully",
      {
        borrowHistory: borrowings,
      },
      StatusCodes.OK
    );
  } catch (error) {
    console.log(error);
    span.addEvent("Failed to fetch History");

    return ResponseHelper.handleError(res, "Failed to fetch History");
  }
};

export const fetchBorrowRequestCodes = async (req: Request, res: Response) => {
  const span = tracer.startSpan("fetchBorrowRequestCodes");

  try {
    let borrowings = await Borrowing.find(
      {
        status: BorrowingStatus.REQUESTED,
      },
      { borrowingId: true }
    ).lean();

    span.addEvent("Borrow request codes fetched successfully");

    ResponseHelper.handleSuccess(
      res,
      "Borrow request codes fetched successfully",
      {
        codes: borrowings.map((e) => e.borrowingId),
      },
      StatusCodes.OK
    );
  } catch (error) {
    console.log(error);
    span.addEvent("Failed to fetch borrow request codes");

    return ResponseHelper.handleError(
      res,
      "Failed to fetch borrow request codes"
    );
  }
};

export const fetchBorrowedBookCodes = async (req: Request, res: Response) => {
  const span = tracer.startSpan("fetchBorrowedBookCodes");

  try {
    let borrowings = await Borrowing.find(
      {
        status: BorrowingStatus.BORROWED,
      },
      { borrowingId: true }
    ).lean();

    span.addEvent("Borrowed book codes fetched successfully");

    ResponseHelper.handleSuccess(
      res,
      "Borrowed book codes fetched successfully",
      {
        codes: borrowings.map((e) => e.borrowingId),
      },
      StatusCodes.OK
    );
  } catch (error) {
    console.log(error);
    span.addEvent("Failed to fetch borrowed book codes");

    return ResponseHelper.handleError(
      res,
      "Failed to fetch borrowed book codes"
    );
  }
};

export const issueBook = async (req: Request, res: Response) => {
  const span = tracer.startSpan("issueBook");

  try {
    const { borrowingId } = req.params;
    const borrowing = await Borrowing.findOne({ borrowingId }).lean();

    if (!borrowing) {
      span.addEvent("Borrowing request not found");

      return ResponseHelper.handleError(
        res,
        "Borrowing request not found",
        undefined,
        StatusCodes.NOT_FOUND
      );
    }

    await Borrowing.findOneAndUpdate(
      { borrowingId: borrowing.borrowingId },
      {
        issuedDate: DateUtil.today(),
        dueDate: DateUtil.afterDays(
          config.get<number>("borrowing.dueInDays") || 15
        ),
        status: BorrowingStatus.BORROWED,
      }
    );

    span.addEvent("Book issued successfully");

    ResponseHelper.handleSuccess(
      res,
      "Book issued successfully",
      undefined,
      StatusCodes.OK
    );
  } catch (error) {
    console.log(error);
    span.addEvent("Failed to issue book");

    return ResponseHelper.handleError(res, "Failed to issue book");
  }
};

export const returnBook = async (req: Request, res: Response) => {
  const span = tracer.startSpan("returnBook");

  try {
    const { borrowingId } = req.params;
    const borrowing = await Borrowing.findOne({ borrowingId }).lean();

    if (!borrowing) {
      span.addEvent("Borrowing info not found");

      return ResponseHelper.handleError(
        res,
        "Borrowing info not found",
        undefined,
        StatusCodes.NOT_FOUND
      );
    }

    await Borrowing.findOneAndUpdate(
      { borrowingId: borrowing.borrowingId },
      {
        status: BorrowingStatus.RETURNED,
        returnedDate: DateUtil.today(),
      }
    );

    await Book.findOneAndUpdate(
      {
        bookId: borrowing.bookId,
      },
      { $inc: { totalCopies: 1 } }
    );

    span.addEvent("Book returned successfully");

    ResponseHelper.handleSuccess(
      res,
      "Book returned successfully",
      undefined,
      StatusCodes.OK
    );
  } catch (error) {
    console.log(error);
    span.addEvent("Failed to return book");

    return ResponseHelper.handleError(res, "Failed to return book");
  }
};
