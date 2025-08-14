import { Genre } from "app/types";
import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const Schema = mongoose.Schema;

export interface IBook {
  bookId: string;
  title: string;
  author: string;
  description: string;
  logo: string;
  genre: Genre;
  totalCopies: number;
}

const BookSchema = new Schema<IBook>(
  {
    bookId: {
      type: String,
      unique: true,
      default: () => uuidv4(),
    },
    title: { type: String, required: true },
    author: { type: String, required: true },
    description: { type: String, required: true },
    logo: { type: String, required: true },
    genre: { type: String, required: true },
    totalCopies: { type: Number, default: 1 },
  },
  { timestamps: true }
);

export const Book = mongoose.model<IBook>("Book", BookSchema);
