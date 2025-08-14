import { ResponseHelper } from "app/utils/ResponseHelper.js";
import { StatusCodes } from "http-status-codes";
import { Request, Response } from "express";
import { User } from "app/models/User.js";
import { PasswordUtil } from "app/utils/PasswordUtil";
import { TokenUtil } from "app/utils/TokenUtil";
import { tracer } from "app/monitoring";

export const signUpUser = async (req: Request, res: Response) => {
  const span = tracer.startSpan("signUpUser");
  try {
    const { fullName, userName, email, password } = req.body;
    const isExistingUser = await User.findOne({
      $or: [{ userName }, { email }],
    });

    if (isExistingUser && isExistingUser.email === email) {
      span.addEvent("Email already exists");
      return ResponseHelper.handleError(
        res,
        "Email already exists",
        undefined,
        StatusCodes.CONFLICT
      );
    }

    if (isExistingUser && isExistingUser.userName === userName) {
      span.addEvent("UserName already exists");
      return ResponseHelper.handleError(
        res,
        "UserName already exists",
        undefined,
        StatusCodes.CONFLICT
      );
    }

    const user = await User.create({
      fullName,
      userName: userName.toLowerCase(),
      email,
      password,
    });

    span.addEvent("User successfully registered");
    ResponseHelper.handleSuccess(
      res,
      "User successfully registered",
      undefined,
      StatusCodes.CREATED
    );
  } catch (error) {
    console.log(error);
    span.addEvent("Creating user failed");
    return ResponseHelper.handleError(res, "Creating user failed");
  } finally {
    span.end();
  }
};

export const signInUser = async (req: Request, res: Response) => {
  const span = tracer.startSpan("signInUser");
  span.addEvent("Invoking signInUser");

  try {
    const { userName, password } = req.body;
    const user = await User.findOne({
      $or: [{ userName }, { email: userName }],
    }).lean();

    if (!user) {
      span.addEvent("User not found");

      return ResponseHelper.handleError(
        res,
        "User not found",
        undefined,
        StatusCodes.NOT_FOUND
      );
    }

    if (!(await PasswordUtil.verifyPassword(password, user.password))) {
      span.addEvent("Invalid credentials");
      return ResponseHelper.handleError(
        res,
        "Invalid credentials",
        undefined,
        StatusCodes.UNAUTHORIZED
      );
    }

    const token = TokenUtil.generateToken(user);
    span.addEvent("Login successful");

    ResponseHelper.handleSuccess(
      res,
      "Login successful",
      {
        user: { ...user, token },
      },
      StatusCodes.OK
    );
  } catch (error) {
    console.log(error);
    span.addEvent("Failed to login");
    return ResponseHelper.handleError(res, "Login failed");
  } finally {
    span.end();
  }
};

export const signOutUser = async (req: Request, res: Response) => {
  const span = tracer.startSpan("signOutUser");
  span.addEvent("Invoking signOutUser");

  ResponseHelper.handleSuccess(res, "Logout successful", {}, StatusCodes.OK);
};
