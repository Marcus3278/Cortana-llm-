const { app, BrowserWindow, ipcMain, globalShortcut } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets/icons/cortana.png'),
    titleBarStyle: 'hiddenInset',
    frame: true,
    show: false
  });

  // Load the app
  mainWindow.loadFile('src/index.html');

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Register global shortcut for wake word
  globalShortcut.register('CommandOrControl+Shift+C', () => {
    if (mainWindow) {
      mainWindow.webContents.send('wake-word-triggered');
      mainWindow.focus();
    }
  });
}

// App event handlers
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

// IPC handlers
ipcMain.handle('get-system-info', async () => {
  const os = require('os');
  return {
    platform: os.platform(),
    arch: os.arch(),
    cpus: os.cpus().length,
    memory: Math.round(os.totalmem() / 1024 / 1024 / 1024) + ' GB',
    uptime: Math.round(os.uptime() / 3600) + ' hours'
  };
});

ipcMain.handle('search-files', async (event, query) => {
  const fs = require('fs').promises;
  const path = require('path');
  
  async function searchInDirectory(dir, query, results = []) {
    try {
      const files = await fs.readdir(dir);
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = await fs.stat(filePath);
        
        if (stat.isDirectory() && !file.startsWith('.')) {
          await searchInDirectory(filePath, query, results);
        } else if (file.toLowerCase().includes(query.toLowerCase())) {
          results.push(filePath);
        }
      }
    } catch (error) {
      // Skip directories we can't access
    }
    return results;
  }
  
  const homeDir = require('os').homedir();
  return await searchInDirectory(homeDir, query);
});

ipcMain.handle('minimize-window', () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
});

ipcMain.handle('close-window', () => {
  if (mainWindow) {
    mainWindow.close();
  }
});
