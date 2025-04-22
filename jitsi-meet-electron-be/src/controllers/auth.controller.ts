import { Request, Response } from "express";
import { Client } from "openid-client";
import { configureClient } from "../config/auth.config";
import { putCookies } from "../services/auth.service";
import logger from "../utils/logger";

let client: Client;

export const getAuthUrl = async (req: Request, res: Response) => {
  try {
    client = await configureClient();
    const authorizationUrl = client.authorizationUrl({
      redirect_uri: process.env.SSO_COMEBACK_URL!,
      scope: "openid profile email",
    });
    res.json(authorizationUrl);
  } catch (error) {
    logger.error("Failed to configure SSO client", error);
    return res.status(500).json({ error: "Failed to configure SSO client" });
  }
};

export const handleCallback = async (req: Request, res: Response) => {
  try {
    const tokenSet = await client.callback(process.env.SSO_COMEBACK_URL!, req.query);
    const isVerified = await client.introspect(tokenSet.access_token!);

    if (isVerified.active) {
      const { ssoUser, refreshToken } = putCookies(tokenSet, res);
      // ?accessToken=${tokenSet.access_token}&refreshToken=${refreshToken}
      const redirectUrl = `${process.env.MAIN_APP_HOME_PAGE}`;
      res.redirect(redirectUrl);
    } else {
      logger.error("Token invalid");
      res.status(401).send("Token is not active");
    }
  } catch (error) {
    logger.error("Failed to authenticate", error);
    res.status(500).send("Internal Server Error");
  }
};

export const refreshTokenHandler = async (req: Request, res: Response) => {
  try {
    client = await configureClient();
    const authHeader = req.headers?.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(400).send("Authorization header missing or incorrect");
    }

    const curRefreshToken = authHeader.split(" ")[1];
    const isRefreshedVerified = await client.introspect(curRefreshToken);

    if (isRefreshedVerified?.active) {
      const refreshedTokenSet = await client.refresh(curRefreshToken);
      const { ssoUser, refreshToken } = putCookies(refreshedTokenSet, res);
      res.send({
        accessToken: refreshedTokenSet.access_token!,
        refreshToken,
        isValid: true,
      });
    } else {
      res.status(401).send({ isValid: false });
    }
  } catch (error) {
    logger.error("Failed to refresh token", error);
    res.status(401).send("Refresh token is not active");
  }
};

export const verifyToken = async (req: Request, res: Response) => {
  try {
    client = await configureClient();
    const token = req.headers?.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const isVerified = await client.introspect(token);
    if (isVerified.active) {
      const userClaims = await client.userinfo(token);
      res.status(200).json(userClaims);
    } else {
      res.status(401).json({ message: "Invalid token" });
    }
  } catch (error) {
    logger.error("Token verification failed", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
