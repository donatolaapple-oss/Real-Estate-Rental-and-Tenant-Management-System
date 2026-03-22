import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const AdminUserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 5,
      select: false,
    },
    firstName: { type: String, default: "Admin" },
    lastName: { type: String, default: "User" },
  },
  { timestamps: true }
);

AdminUserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

AdminUserSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

const accessSecret = () =>
  process.env.ACCESS_TOKEN_SECRET_ADMIN || process.env.ACCESS_TOKEN_SECRET_OWNER;
const refreshSecret = () =>
  process.env.REFRESH_TOKEN_SECRET_ADMIN || process.env.REFRESH_TOKEN_SECRET_OWNER;

AdminUserSchema.methods.createAccessToken = function () {
  return jwt.sign(
    { userId: this._id, userType: "admin" },
    accessSecret(),
    { expiresIn: process.env.ACCESS_LIFETIME || "15m" }
  );
};

AdminUserSchema.methods.createRefreshToken = function () {
  return jwt.sign(
    { userId: this._id, userType: "admin" },
    refreshSecret(),
    { expiresIn: process.env.REFRESH_LIFETIME || "7d" }
  );
};

export default mongoose.model("AdminUser", AdminUserSchema);
