import { IUser } from "app/models/User";
import jwt from "jsonwebtoken";
import config from "config";
import { Token } from "app/types";
import { CookieOptions } from "express";

export class TokenUtil {
  private static secret: string = config.get<string>("token.jwtTokenSecret");

  static generateToken = (user: IUser) => {
    try {
      const token = jwt.sign(
        {
          userId: user.userId,
          email: user.email,
          userName: user.userName,
          fullName: user.fullName,
          role: user.role,
        },
        this.secret,
        {
          expiresIn: "360d",
        }
      );

      return token;
    } catch (error) {
      throw new Error("Could not generate token");
    }
  };

  static verifyToken = (token: string): Token => {
    try {
      const decodeToken = jwt.verify(token, this.secret) as Token;

      return decodeToken;
    } catch (error) {
      throw new Error("Could not verify token");
    }
  };
}

export const tokenOptions: CookieOptions = {
  httpOnly: true,
  sameSite: "none",
  secure: true,
  maxAge: 86400000,
};
