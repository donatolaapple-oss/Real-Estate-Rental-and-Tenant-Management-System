import jwt from "jsonwebtoken";
import { UnAuthorizedError } from "../request-errors/index.js";

const authorizeOwnerUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer")) {
    throw new UnAuthorizedError("User is not Authorized");
  }

  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_OWNER);
    const ut = payload.userType;
    if (ut && ut !== "landlord" && ut !== "owner") {
      throw new UnAuthorizedError("Access Token is not valid");
    }
    req.user = { userId: payload.userId, userType: ut || "landlord" };
    next();
  } catch (error) {
    throw new UnAuthorizedError("Access Token is not valid");
  }
};

/** Alias — StayScout landlord role */
const authorizeLandlord = authorizeOwnerUser;

const authorizeTenantUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer")) {
    throw new UnAuthorizedError("User is not Authorized");
  }

  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_TENANT);
    const ut = payload.userType;
    if (ut && ut !== "tenant") {
      throw new UnAuthorizedError("Access Token is not valid");
    }
    req.user = { userId: payload.userId, userType: "tenant" };
    next();
  } catch (error) {
    throw new UnAuthorizedError("Access Token is not valid");
  }
};

const authorizeAdmin = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer")) {
    throw new UnAuthorizedError("User is not Authorized");
  }
  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET_ADMIN || process.env.ACCESS_TOKEN_SECRET_OWNER
    );
    if (payload.userType !== "admin") {
      throw new UnAuthorizedError("Access Token is not valid");
    }
    req.user = { userId: payload.userId, userType: "admin" };
    next();
  } catch (error) {
    throw new UnAuthorizedError("Access Token is not valid");
  }
};

export { authorizeOwnerUser, authorizeLandlord, authorizeTenantUser, authorizeAdmin };
