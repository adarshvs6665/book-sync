import { Role } from "app/enums";
import { PasswordUtil } from "app/utils/PasswordUtil";
import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const Schema = mongoose.Schema;

export interface IUser {
  userId: string;
  fullName: string;
  userName: string;
  email: string;
  password: string;
  profilePicture: string;
  role: Role;
  verifyPassword(password: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    userId: {
      type: String,
      unique: true,
      default: () => uuidv4(),
    },
    fullName: { type: String, required: true, trim: true },
    userName: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    profilePicture: {
      type: String,
      default:
        "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png",
    },
    role: { type: String, default: Role.USER },
  },
  { timestamps: true }
);

UserSchema.pre<IUser>("save", async function (next) {
  const hashedPassword = await PasswordUtil.hashPassword(this.password);
  this.password = hashedPassword;

  next();
});

export const User = mongoose.model<IUser>("User", UserSchema);
