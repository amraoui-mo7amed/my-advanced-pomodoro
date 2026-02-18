const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

const userDataPath = app.getPath('userData');
const dbPath = path.join(userDataPath, 'db.json');

// Initialize DB if not exists
if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, JSON.stringify({ projects: [] }, null, 2));
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    backgroundColor: '#F8F9FA',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    titleBarStyle: 'hiddenInset'
  });

  win.loadFile('index.html');
}

// IPC Handlers for DB operations
ipcMain.handle('save-projects', (event, projects) => {
  try {
    fs.writeFileSync(dbPath, JSON.stringify({ projects }, null, 2));
    return { success: true };
  } catch (err) {
    console.error('Failed to save projects:', err);
    return { success: false, error: err.message };
  }
});

ipcMain.handle('load-projects', () => {
  try {
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data).projects;
  } catch (err) {
    console.error('Failed to load projects:', err);
    return [];
  }
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
