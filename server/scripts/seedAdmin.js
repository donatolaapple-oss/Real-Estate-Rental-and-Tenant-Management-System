/**
 * Seed LGU admin — demo login without registration.
 * Email: admin@stayscout.com  Password: admin123
 * Run from server/: node scripts/seedAdmin.js
 */
import dotenv from "dotenv";
dotenv.config();

import connectDB from "../database/connectDB.js";
import AdminUser from "../models/AdminUser.js";
import mongoose from "mongoose";

const DEMO_EMAIL = "admin@stayscout.com";
const DEMO_PASSWORD = "admin123";

async function run() {
  await connectDB(process.env.MONGO_URI);

  const email = process.env.ADMIN_EMAIL || DEMO_EMAIL;
  const password = process.env.ADMIN_PASSWORD || DEMO_PASSWORD;

  let admin = await AdminUser.findOne({ email });
  if (admin) {
    admin.password = password;
    admin.markModified("password");
    await admin.save();
    console.log("Admin password refreshed:", email);
  } else {
    admin = await AdminUser.create({
      email,
      password,
      firstName: "LGU",
      lastName: "Admin",
    });
    console.log("Admin created:", email);
  }

  await mongoose.connection.close();
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
