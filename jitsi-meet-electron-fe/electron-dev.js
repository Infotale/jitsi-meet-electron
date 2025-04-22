// Simple script to run Electron in development mode
const { spawn } = require("child_process");
const electron = require("electron");
const path = require("path");

console.log("Compiling main process code...");

// First, compile the main process code
const webpack = spawn(
  "npx",
  ["webpack", "--config", "./webpack.main.js", "--mode", "development"],
  {
    stdio: "inherit",
  },
);

// When webpack is done, start Electron
webpack.on("close", (code) => {
  if (code !== 0) {
    console.error("webpack process exited with code " + code);
    return;
  }

  console.log("Starting Electron...");

  // Set environment variables for development mode
  const env = Object.assign({}, process.env, {
    NODE_ENV: "development",
    JITSI_MEET_LOCALHOST_URL: "http://localhost:3001", // Add this environment variable
  });

  // Start Electron with main.js
  const electronProcess = spawn(electron, ["./build/main.js"], {
    stdio: "inherit",
    env: env,
  });

  electronProcess.on("close", (code) => {
    console.log("Electron process exited with code " + code);
  });
});
