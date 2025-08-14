import { CookieOptions } from "express";

export type Token = {
  userId: string;
  email: string;
  userName: string;
  fullName: string;
  role: boolean;
};

export type Cookie = {
  name: string;
  value: string;
  options: CookieOptions;
};

export enum Genre {
  Fiction = "fiction",
  NonFiction = "non-fiction",
  Mystery = "mystery",
  Thriller = "thriller",
  Romance = "romance",
  ScienceFiction = "science-fiction",
  Fantasy = "fantasy",
  Biography = "biography",
  History = "history",
}
