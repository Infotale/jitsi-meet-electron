// Simple script to run Electron in development mode
const { spawn } = require("child_process");
const electron = require("electron");
const path = require("path");

console.log("Compiling main process code...");

// First, compile the main process code
const webpackBin = process.platform === "win32" ? "webpack.cmd" : "webpack";
const webpack = spawn(webpackBin, ["--config", "./webpack.main.js", "--mode", "development"], {
  stdio: "inherit",
  shell: true, // Add this for Windows compatibility
});

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
    JITSI_MEET_LOCALHOST_URL: "http://localhost:3001",
  });

  // Use path.join for cross-platform compatibility
  const mainPath = path.join(__dirname, "build", "main.js");

  // Start Electron with main.js
  const electronProcess = spawn(electron, [mainPath], {
    stdio: "inherit",
    env: env,
    shell: true, // Add this for Windows compatibility
  });

  electronProcess.on("close", (code) => {
    console.log("Electron process exited with code " + code);
  });
});
