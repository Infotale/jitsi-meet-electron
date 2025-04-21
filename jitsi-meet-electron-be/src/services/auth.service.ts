import { Response } from "express";
import { TokenSet } from "openid-client";
import jwt from "jsonwebtoken";

export const putCookies = (tokenSet: TokenSet, res: Response) => {
  const codedSsoUser = tokenSet.claims();
  const accessToken = tokenSet.access_token;

  const ssoUser = jwt.sign({ ...codedSsoUser }, process.env.SSO_CLIENT_SECRET!, {
    algorithm: "HS256",
  });

  const signedAccessToken = jwt.sign({ accessToken }, process.env.SSO_CLIENT_SECRET!, {
    algorithm: "HS256",
  });

  res.cookie("ssoUser", ssoUser, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.cookie("refreshToken", tokenSet.refresh_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.cookie("accessToken", signedAccessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  return { ssoUser, refreshToken: tokenSet.refresh_token };
};
