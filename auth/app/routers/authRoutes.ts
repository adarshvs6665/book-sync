import express, { type Router } from "express";
import { validateRequest } from "app/middlewares/validator";
import { signInUserSchema, signUpUserSchema } from "app/schemas";
import {
  signInUser,
  signOutUser,
  signUpUser,
} from "app/controllers/authController";
import { registerLibrarian } from "app/controllers/librarianController";

const authRouter: Router = express.Router();

authRouter.post("/sign-up", validateRequest(signUpUserSchema), signUpUser);
authRouter.post("/sign-in", validateRequest(signInUserSchema), signInUser);
authRouter.post("/sign-out", signOutUser);
authRouter.post(
  "/create-librarian",
  validateRequest(signUpUserSchema),
  registerLibrarian
);

export { authRouter };
