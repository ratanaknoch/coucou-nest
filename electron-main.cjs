const { app, BrowserWindow, Menu } = require("electron");
const path = require("path");

// Force production environment so the Express server serves our static built frontend
process.env.NODE_ENV = "production";

// Start the bundled Express backend server
try {
  require("./dist/server.cjs");
  console.log("Express backend initialized within Electron main process.");
} catch (error) {
  console.error("Failed to load Express server within Electron:", error);
}

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    title: "Coucou Nest - Socratic Sandbox",
    show: false, // Don't show until page loads to prevent flickering
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Load the local Express server
  mainWindow.loadURL("http://localhost:3000");

  // Show the window when the page is ready
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  // Remove the default menu bar for a cleaner desktop app feel
  Menu.setApplicationMenu(null);

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});
