import { Role } from "app/enums";
import { IUser } from "app/models/User";
import { ResponseHelper } from "app/utils/ResponseHelper";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

export const verifyLibrarian = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user: IUser = res.locals.user

    if (user.role !== Role.LIBRARIAN) {
      return ResponseHelper.handleError(
        res,
        "Unauthorized",
        {},
        StatusCodes.UNAUTHORIZED
      );
    }

    next();
  } catch (error) {
    return ResponseHelper.handleError(
      res,
      "Unauthorized",
      {},
      StatusCodes.UNAUTHORIZED
    );
  }
};
