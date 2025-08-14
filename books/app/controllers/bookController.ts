import { ResponseHelper } from "app/utils/ResponseHelper.js";
import { StatusCodes } from "http-status-codes";
import { Request, Response } from "express";
import { Book } from "app/models/Book";
import { tracer } from "app/monitoring";

export const createBook = async (req: Request, res: Response) => {
  const span = tracer.startSpan("createBook");
  try {
    const { title, author, description, logo, genre, totalCopies } = req.body;
    const book = await Book.create({
      title,
      author,
      description,
      logo,
      genre,
      totalCopies: totalCopies > 0 ? totalCopies : 1,
    });

    span.addEvent("Book successfully created");

    ResponseHelper.handleSuccess(
      res,
      "Book successfully created",
      undefined,
      StatusCodes.CREATED
    );
  } catch (error) {
    console.log(error);
    span.addEvent("Creating book failed");

    return ResponseHelper.handleError(res, "Creating book failed");
  } finally {
    span.end();
  }
};

export const bulkCreateBooks = async (req: Request, res: Response) => {
  const span = tracer.startSpan("bulkCreateBooks");
  try {
    const books = req.body;
    const book = await Book.insertMany(books);

    span.addEvent("Books successfully created");

    ResponseHelper.handleSuccess(
      res,
      "Books successfully created",
      undefined,
      StatusCodes.CREATED
    );
  } catch (error) {
    console.log(error);
    span.addEvent("Creating books failed");

    return ResponseHelper.handleError(res, "Creating books failed");
  } finally {
    span.end();
  }
};

export const fetchBooks = async (req: Request, res: Response) => {
  const span = tracer.startSpan("fetchBooks");
  try {
    const books = await Book.find().sort({ createdAt: -1 }).lean();

    span.addEvent("Books successfully fetched");

    ResponseHelper.handleSuccess(
      res,
      "Books successfully fetched",
      { books },
      StatusCodes.OK
    );
  } catch (error) {
    console.log(error);
    span.addEvent("Fetching books failed");

    return ResponseHelper.handleError(res, "Fetching books failed");
  } finally {
    span.end();
  }
};

export const updateBook = async (req: Request, res: Response) => {
  const span = tracer.startSpan("updateBook");
  try {
    const { title, author, description, logo, genre, totalCopies } = req.body;
    const { bookId } = req.params;

    const book = await Book.findOne({ bookId }).lean();

    if (!book) {
      span.addEvent(`Book not found with id ${bookId}`);

      return ResponseHelper.handleError(
        res,
        "Book not found",
        undefined,
        StatusCodes.NOT_FOUND
      );
    }

    await Book.findOneAndUpdate(
      {
        bookId: bookId,
      },
      {
        title,
        author,
        description,
        logo,
        genre,
        totalCopies: totalCopies > 0 ? totalCopies : 1,
      }
    );

    span.addEvent("Book successfully updated");

    ResponseHelper.handleSuccess(
      res,
      "Book successfully updated",
      undefined,
      StatusCodes.CREATED
    );
  } catch (error) {
    console.log(error);
    span.addEvent("Failed to update book");

    return ResponseHelper.handleError(res, "Updating book failed");
  } finally {
    span.end();
  }
};

export const deleteBook = async (req: Request, res: Response) => {
  const span = tracer.startSpan("deleteBook");
  try {
    const { bookId } = req.params;

    const book = await Book.findOne({ bookId }).lean();

    if (!book) {
      span.addEvent(`Book not found with id ${bookId}`);

      return ResponseHelper.handleError(
        res,
        "Book not found",
        undefined,
        StatusCodes.NOT_FOUND
      );
    }

    await Book.deleteOne({
      bookId: bookId,
    });

    span.addEvent("Book successfully deleted");

    ResponseHelper.handleSuccess(
      res,
      "Book successfully deleted",
      undefined,
      StatusCodes.CREATED
    );
  } catch (error) {
    console.log(error);
    span.addEvent("Deleting book failed");

    return ResponseHelper.handleError(res, "Deleting book failed");
  } finally {
    span.end();
  }
};
