import type { Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ServiceResponse } from "./serviceResponse";
import { Cookie } from "app/types";

export class ResponseHelper {
  public static handleSuccess = (
    res: Response,
    message: string,
    data?: any | null,
    statusCode = StatusCodes.OK,
    cookies?: Cookie[]
  ) => {
    const response = ServiceResponse.success(message, data, statusCode);

    if (cookies) {
      cookies.forEach((cookie) => {
        res.cookie(cookie.name, cookie.value, cookie.options);
      });
    }

    return res.status(response.statusCode).send(response);
  };

  public static handleError = (
    res: Response,
    message: string,
    data?: any | null,
    statusCode = StatusCodes.INTERNAL_SERVER_ERROR
  ) => {
    const response = ServiceResponse.failure(message, data, statusCode);

    return res.status(response.statusCode).send(response);
  };
}
