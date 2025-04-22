// Windows-only script to run Electron in development mode
const { execSync, spawn } = require("child_process");
const electron = require("electron");
const path = require("path");

console.log("Compiling main process code...");

try {
  // Use execSync for webpack to handle paths with spaces better
  execSync('".\\node_modules\\.bin\\webpack.cmd" --config webpack.main.js --mode development', {
    stdio: "inherit",
    shell: true,
    cwd: __dirname, // This ensures we're in the correct directory
  });

  console.log("Starting Electron...");

  // Set environment variables for development mode
  const env = Object.assign({}, process.env, {
    NODE_ENV: "development",
    JITSI_MEET_LOCALHOST_URL: "http://localhost:3001",
  });

  // Start Electron with main.js using absolute paths to handle spaces
  const mainPath = path.join(__dirname, "build", "main.js");

  const electronProcess = spawn(electron, [`"${mainPath}"`], {
    stdio: "inherit",
    env: env,
    shell: true,
    cwd: __dirname, // This ensures we're in the correct directory
  });

  electronProcess.on("close", (code) => {
    console.log("Electron process exited with code " + code);
  });
} catch (error) {
  console.error("Error occurred:", error);
  process.exit(1);
}
