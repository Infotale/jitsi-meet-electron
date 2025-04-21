import { NextFunction, Request, Response } from "express";
import { Client } from "openid-client";
import jwt from "jsonwebtoken";
import logger from "../utils/logger";
import { configureClient } from "../config/auth.config";

let client: Client;

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const headerAccessToken = req.headers?.authorization;
  client = await configureClient();

  if (!headerAccessToken) {
    return res.status(401).json({ error: "Access token is missing or invalid." });
  }

  try {
    const accessToken = headerAccessToken.split(" ")[1];
    const isVerified = await client.introspect(accessToken);

    if (!isVerified.active) {
      return res.status(401).json({ error: "Access token is inactive or invalid." });
    }
  } catch (err) {
    logger.error("Error in Auth Middleware:", err);

    if (err instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: "Access token has expired." });
    } else if (err instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: "Invalid access token." });
    } else {
      return res.status(500).json({ error: "Internal server error." });
    }
  }

  next();
};
