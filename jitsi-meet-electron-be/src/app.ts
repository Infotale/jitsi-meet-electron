import express from "express";
import cors from "cors";
import session from "express-session";
import { configureClient } from "./config/auth.config";
import authRoutes from "./routes/auth.routes";
import logger from "./utils/logger";

const app = express();
const port = process.env.PORT || 3000;

import dotenv, { config } from "dotenv";

// Before importing and running anything we should import .env
dotenv.config();

// Middleware
app.use(
  cors({
    origin: ["http://localhost:3001"], // Allow both origins
    credentials: true, // Allow cookies
  }),
);
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  }),
);

// Initialize OpenID Client
configureClient().catch((error) => {
  logger.error("Failed to configure OpenID client:", error);
  process.exit(1);
});

// Routes
app.use("/auth", authRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
});
