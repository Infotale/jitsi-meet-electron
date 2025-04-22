const { app, BrowserWindow } = require("electron");
const path = require("path");

// Constants
const WINDOW_WIDTH = 1200;
const WINDOW_HEIGHT = 800;
const APP_URL = "http://localhost:3001";

let mainWindow;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // Load the local development URL
  mainWindow.loadURL(APP_URL);

  // Optional: Open DevTools
  mainWindow.webContents.openDevTools();
}

app.on("ready", () => {
  createMainWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
