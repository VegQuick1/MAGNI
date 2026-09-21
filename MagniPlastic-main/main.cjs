const { app, BrowserWindow } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

let serverProcess;

function createWindow() {
  const win = new BrowserWindow({
    width: 1366,
    height: 768,
    title: "PlastiControl ERP",
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  let backendPath = path.join(__dirname, 'backend-bin', 'backend-erp.exe');
  if (app.isPackaged) {
    backendPath = path.join(process.resourcesPath, 'backend-bin', 'backend-erp.exe');
  }

  if (fs.existsSync(backendPath)) {
    serverProcess = spawn(backendPath, [], { detached: false, windowsHide: true });
  } else {
    console.log("No se encontró el ejecutable del backend en:", backendPath);
  }

  setTimeout(() => {
    win.loadURL('http://localhost:3001'); 
  }, 2000);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (serverProcess) serverProcess.kill();
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  if (serverProcess) serverProcess.kill();
});