import { z } from "zod";

export const createBookSchema = z.object({
  body: z.object({
    title: z
      .string({ required_error: "title is required" })
      .trim()
      .min(1, { message: "Title must be at least 1 character" })
      .max(200, { message: "Title must be at most 200 characters" }),
    author: z
      .string({ required_error: "author is required" })
      .trim()
      .min(1, { message: "Author must be at least 1 character" })
      .max(100, { message: "Author must be at most 100 characters" }),
    description: z
      .string({ required_error: "description is required" })
      .trim()
      .min(1, { message: "Description must be at least 1 character" })
      .max(1000, { message: "Description must be at most 1000 characters" }),
    logo: z
      .string({ required_error: "logo is required" })
      .url({ message: "Invalid logo URL" }),
    genre: z
      .string({ required_error: "genre is required" })
      .trim()
      .min(1, { message: "Genre must be at least 1 character" })
      .max(50, { message: "Genre must be at most 50 characters" }),
    totalCopies: z
      .number({ required_error: "totalCopies is required" })
      .min(0, { message: "Total copies must be at least 0" }),
  }),
});

export const bulkCreateBooksSchema = z.object({
  body: z.array(
    z.object({
      title: z
        .string({ required_error: "title is required" })
        .trim()
        .min(1, { message: "Title must be at least 1 character" })
        .max(200, { message: "Title must be at most 200 characters" }),
      author: z
        .string({ required_error: "author is required" })
        .trim()
        .min(1, { message: "Author must be at least 1 character" })
        .max(100, { message: "Author must be at most 100 characters" }),
      description: z
        .string({ required_error: "description is required" })
        .trim()
        .min(1, { message: "Description must be at least 1 character" })
        .max(1000, {
          message: "Description must be at most 1000 characters",
        }),
      logo: z
        .string({ required_error: "logo is required" })
        .url({ message: "Invalid logo URL" }),
      genre: z
        .string({ required_error: "genre is required" })
        .trim()
        .min(1, { message: "Genre must be at least 1 character" })
        .max(50, { message: "Genre must be at most 50 characters" }),
      totalCopies: z
        .number({ required_error: "totalCopies is required" })
        .min(0, { message: "Total copies must be at least 0" }),
    })
  ),
});

export const updateBookSchema = z.object({
  params: z.object({
    bookId: z.string({ required_error: "bookId is required" }),
  }),
  body: z.object({
    title: z
      .string({ required_error: "title is required" })
      .trim()
      .min(1, { message: "Title must be at least 1 character" })
      .max(200, { message: "Title must be at most 200 characters" }),
    author: z
      .string({ required_error: "author is required" })
      .trim()
      .min(1, { message: "Author must be at least 1 character" })
      .max(100, { message: "Author must be at most 100 characters" }),
    description: z
      .string({ required_error: "description is required" })
      .trim()
      .min(1, { message: "Description must be at least 1 character" })
      .max(1000, { message: "Description must be at most 1000 characters" }),
    logo: z
      .string({ required_error: "logo is required" })
      .url({ message: "Invalid logo URL" }),
    genre: z
      .string({ required_error: "genre is required" })
      .trim()
      .min(1, { message: "Genre must be at least 1 character" })
      .max(50, { message: "Genre must be at most 50 characters" }),
    totalCopies: z
      .number({ required_error: "totalCopies is required" })
      .min(0, { message: "Total copies must be at least 0" }),
  }),
});
