import { ResponseHelper } from "app/utils/ResponseHelper";
import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

export const globalErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  return ResponseHelper.handleError(
    res,
    err.message,
    {
      errors: err,
    },
    StatusCodes.INTERNAL_SERVER_ERROR
  );
};
