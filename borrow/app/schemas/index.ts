import { z } from "zod";

export const borrowRequestSchema = z.object({
  params: z.object({
    bookId: z.string({ required_error: "bookId is required" }),
  }),
});

