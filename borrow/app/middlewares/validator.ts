import { ResponseHelper } from "app/utils/ResponseHelper";
import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import type { ZodError, ZodSchema } from "zod";

export const validateRequest =
  (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({ body: req.body, query: req.query, params: req.params });
      next();
    } catch (err) {
      return ResponseHelper.handleError(
        res,
        "Invalid input",
        {
          errors: (err as ZodError).errors.map((e) => ({
            field: e.path[1],
            message: e.message,
            path: e.path[0],
          })),
        },
        StatusCodes.BAD_REQUEST
      );
    }
  };
