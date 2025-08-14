// import { User } from "app/models/User";
import { ResponseHelper } from "app/utils/ResponseHelper";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import config from "config";
import { TokenUtil } from "app/utils/TokenUtil";
import { User } from "app/models/User";

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const tokenSecret = config.get<string>("token.jwtTokenSecret");

  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return ResponseHelper.handleError(
        res,
        "Missing token",
        {},
        StatusCodes.UNAUTHORIZED
      );
    }

    const decodeToken = TokenUtil.verifyToken(token);
    const user = await User.findOne({ userId: decodeToken.userId }).select(
      "-password"
    );

    if (!user) {
      return ResponseHelper.handleError(
        res,
        "Invalid access token",
        {},
        StatusCodes.UNAUTHORIZED
      );
    }

    res.locals.user = user;
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
