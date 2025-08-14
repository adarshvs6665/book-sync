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
