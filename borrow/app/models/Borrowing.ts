import { BorrowingStatus } from "app/enums";
import { DateUtil } from "app/utils/DateUtil";
import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const Schema = mongoose.Schema;

export interface IBorrowing {
  borrowingId: string;
  userId: string;
  bookId: string;
  borrowRequestDate: Date;
  issuedDate: Date;
  dueDate: Date;
  returnedDate?: Date;
  status: BorrowingStatus;
}

const BorrowingSchema = new Schema<IBorrowing>(
  {
    borrowingId: {
      type: String,
      unique: true,
      default: () => uuidv4().toUpperCase(),
    },
    userId: { type: String, required: true },
    bookId: { type: String, required: true },
    borrowRequestDate: { type: Date, default: DateUtil.today() },
    issuedDate: { type: Date, default: null },
    dueDate: { type: Date, default: null },
    returnedDate: { type: Date, default: null },
    status: {
      type: String,
      default: BorrowingStatus.REQUESTED,
    },
  },
  { timestamps: true }
);

export const Borrowing = mongoose.model<IBorrowing>(
  "Borrowing",
  BorrowingSchema
);
