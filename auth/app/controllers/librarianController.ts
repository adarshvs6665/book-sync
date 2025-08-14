import { ResponseHelper } from "app/utils/ResponseHelper.js";
import { StatusCodes } from "http-status-codes";
import { Request, Response } from "express";
import { User } from "app/models/User.js";
import { Role } from "app/enums";
import { tracer } from "app/monitoring";

export const registerLibrarian = async (req: Request, res: Response) => {
  const span = tracer.startSpan("signOutUser");
  span.addEvent("Invoking registerLibrarian");
  try {
    const { fullName, userName, email, password } = req.body;
    const isExistingUser = await User.findOne({
      $or: [{ userName }, { email }],
    });

    if (isExistingUser) {
      span.addEvent("Librarian already exist");
      return ResponseHelper.handleError(
        res,
        "Already exists",
        undefined,
        StatusCodes.CONFLICT
      );
    }

    const user = await User.create({
      fullName,
      userName: userName.toLowerCase(),
      email,
      password,
      role: Role.LIBRARIAN,
    });

    span.addEvent("Librarian successfully registered");
    ResponseHelper.handleSuccess(
      res,
      "Librarian successfully registered",
      undefined,
      StatusCodes.CREATED
    );
  } catch (error) {
    console.log(error);
    span.addEvent("Creating librarian failed");
    return ResponseHelper.handleError(res, "Creating librarian failed");
  } finally {
    span.end();
  }
};
