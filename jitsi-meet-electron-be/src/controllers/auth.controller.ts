import { Request, Response } from "express";
import { Client } from "openid-client";
import { configureClient } from "../config/auth.config";
import logger from "../utils/logger";

let client: Client;

/**
 * Initiates the login process by redirecting the user to the Identity Provider.
 */
export const getAuthUrl = async (req: Request, res: Response) => {
  try {
    client = await configureClient();
    const authorizationUrl = client.authorizationUrl({
      redirect_uri: process.env.SSO_COMEBACK_URL!,
      scope: "openid profile email",
    });
    // Directly redirect the user to the auth URL
    res.redirect(authorizationUrl);
  } catch (error) {
    logger.error("Failed to configure SSO client", error);
    return res.status(500).send("Failed to initiate login process.");
  }
};

/**
 * Handles the login callback, exchanges the code, and authenticates the user.
 */
export const handleCallback = async (req: Request, res: Response) => {
  try {
    const tokenSet = await client.callback(process.env.SSO_COMEBACK_URL!, req.query);
    const isVerified = await client.introspect(tokenSet.access_token!);

    if (isVerified.active) {
      // Set HTTP-only cookies for security
      res.cookie("session_token", tokenSet.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      if (tokenSet.refresh_token) {
        res.cookie("refresh_token", tokenSet.refresh_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        });
      }

      // Redirect to the main app without exposing tokens in URL
      const redirectUrl = `${process.env.MAIN_APP_HOME_PAGE}?accessToken=${tokenSet.access_token}&refreshToken=${tokenSet.refresh_token}`;

      res.redirect(redirectUrl);
    } else {
      logger.error("Token invalid");
      res.status(401).send("Authentication failed.");
    }
  } catch (error) {
    logger.error("Failed to authenticate", error);
    res.status(500).send("Authentication failed.");
  }
};

/**
 * Refreshes the user's access token using the refresh token.
 */
export const refreshTokenHandler = async (req: Request, res: Response) => {
  try {
    client = await configureClient();

    // Get refresh token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(400).json({ message: "No refresh token provided" });
    }

    const refreshToken = authHeader.split(" ")[1];
    const isRefreshedVerified = await client.introspect(refreshToken);

    if (isRefreshedVerified?.active) {
      const refreshedTokenSet = await client.refresh(refreshToken);

      res.status(200).json({
        accessToken: refreshedTokenSet.access_token,
        refreshToken: refreshedTokenSet.refresh_token,
      });
    } else {
      res.status(401).json({ message: "Invalid refresh token" });
    }
  } catch (error) {
    logger.error("Failed to refresh token", error);
    res.status(401).json({ message: "Failed to refresh token" });
  }
};

/**
 * Verifies the session or access token.
 */
export const verifyToken = async (req: Request, res: Response) => {
  try {
    client = await configureClient();

    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ authenticated: false, message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const isVerified = await client.introspect(token);

    if (isVerified.active) {
      const userClaims = await client.userinfo(token);
      res.status(200).json({ authenticated: true, user: userClaims });
    } else {
      res.status(401).json({ authenticated: false, message: "Invalid or expired token" });
    }
  } catch (error) {
    logger.error("Token verification failed", error);
    res.status(401).json({ authenticated: false, message: "Invalid or expired token" });
  }
};
