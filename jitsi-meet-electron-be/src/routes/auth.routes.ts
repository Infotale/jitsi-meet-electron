import { Router } from "express";
import { configureClient } from "../config/auth.config";
import {
  getAuthUrl,
  handleCallback,
  refreshTokenHandler,
  verifyToken,
} from "../controllers/auth.controller";
import logger from "../utils/logger";

const router = Router();

router.get("/login", getAuthUrl);
router.get("/callback", handleCallback);
router.get("/refresh-token", refreshTokenHandler);
router.get("/verify-token", verifyToken);

export default router;
