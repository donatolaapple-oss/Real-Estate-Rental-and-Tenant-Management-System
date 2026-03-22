import express from "express";
const app = express(); //create an express app
import dotenv from "dotenv"; //to use environment variables
dotenv.config();
import ensureDevSecrets from "./config/ensureDevSecrets.js";
ensureDevSecrets();

import "express-async-errors";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";

//security packages
import helmet from "helmet";
import xss from "xss-clean";
import mongoSanitize from "express-mongo-sanitize";

import connectDB from "./database/connectDB.js"; //function to connect to the database
//routes
import authRoutes from "./routes/authRoutes.js";
import ownerPropertyRoutes from "./routes/ownerPropertyRoutes.js";
import tenantPropertyRoutes from "./routes/tenantPropertyRoutes.js";
import ownerUserRoutes from "./routes/ownerUserRoutes.js";
import tenantUserRoutes from "./routes/tenantUserRoutes.js";
import emailSenderRoutes from "./routes/emailSenderRoutes.js";
import leaseRoutes from "./routes/leaseRoutes.js";
import ownerRentDetailRoutes from "./routes/rentDetailOwnerRoutes.js";
import tenantRentDetailRoutes from "./routes/rentDetailTenantRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import tenantStayScoutRoutes from "./routes/tenantStayScoutRoutes.js";
import sentimentRoutes from "./routes/sentiment.js";
import analyticsRoutes from "./routes/analytics.js";
import adminRoutes from "./routes/adminRoutes.js";

import errorHandlerMiddleware from "./middleware/error-handler.js";
import {
  authorizeOwnerUser,
  authorizeTenantUser,
  authorizeAdmin,
} from "./middleware/userAuthorization.js";
import { Server } from "socket.io";
import socketHandler from "./services/socketHandler.js";

import path, { dirname } from "path";
import { fileURLToPath } from "url";

//using morgan for logging requests
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

//static folder for frontend build files in production mode only (to serve frontend files)
const __dirname = dirname(fileURLToPath(import.meta.url));

//set static folder for frontend build files
app.use(express.static(path.resolve(__dirname, "../client/dist")));

app.use(express.json()); //to parse json data
app.use(helmet({ contentSecurityPolicy: false })); //secure headers
app.use(xss()); //sanitize input , prevent cross site scripting
app.use(mongoSanitize()); //prevents mongodb operator injection

app.set("trust proxy", 1); //trust first proxy

const corsDevOrigin = (origin, cb) => {
  if (!origin) return cb(null, true);
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin)) {
    return cb(null, true);
  }
  return cb(null, false);
};

app.use(
  cors(
    process.env.NODE_ENV === "production"
      ? {
          origin: process.env.CLIENT_URL || "http://localhost:5175",
          credentials: true,
        }
      : { origin: corsDevOrigin, credentials: true }
  )
); //to allow cross origin requests
app.use(cookieParser()); //to parse cookies

app.use(function (req, res, next) {
  res.header("Content-Type", "application/json;charset=UTF-8");
  res.header("Access-Control-Allow-Credentials", true);
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/owner/real-estate", authorizeOwnerUser, ownerPropertyRoutes);
app.use("/api/tenant/real-estate", authorizeTenantUser, tenantPropertyRoutes);

app.use("/api/owner", authorizeOwnerUser, ownerUserRoutes);
app.use("/api/tenant", authorizeTenantUser, tenantUserRoutes);

app.use("/api/sendEmail", emailSenderRoutes); //send email

app.use("/api/lease", leaseRoutes);

app.use("/api/rentDetailOwner", authorizeOwnerUser, ownerRentDetailRoutes);
app.use("/api/rentDetailTenant", authorizeTenantUser, tenantRentDetailRoutes);

app.use("/api/chat", chatRoutes);

/** StayScout */
app.use("/api/tenant/stayscout", tenantStayScoutRoutes);
app.use("/api/sentiment", sentimentRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/admin", authorizeAdmin, adminRoutes);

/** Landlord API alias (same handlers as owner) */
app.use("/api/landlord/real-estate", authorizeOwnerUser, ownerPropertyRoutes);
app.use("/api/landlord", authorizeOwnerUser, ownerUserRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

app.get("*", (req, res) => {
  if (req.path.startsWith("/api")) {
    return res.status(404).json({ msg: "Route does not exist" });
  }
  res.sendFile(path.resolve(__dirname, "../client/dist", "index.html"));
});

app.use(errorHandlerMiddleware);

const PORT = process.env.PORT || 5002; //port number (StayScout local dev)

//start the server and connect to the database
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
  } catch (error) {
    console.log(error);
  }
};
start();

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Socket setup (dev: reflect request origin so any localhost port works)
const io = new Server(server, {
  cors:
    process.env.NODE_ENV === "production"
      ? {
          origin: process.env.CLIENT_URL || "http://localhost:5175",
          credentials: true,
        }
      : { origin: true, credentials: true },
  connectionStateRecovery: {},
});

socketHandler(io);