// ═══════════════════════════════════════════════════════
// AnimeBill — Electron Main Process
// Creates a desktop app from the web version
// © AnimeBill by iprsnmsra | github.com/iprsnmsra
// ═══════════════════════════════════════════════════════

const { app, BrowserWindow, Menu, shell, dialog } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width:     1300,
    height:    820,
    minWidth:  960,
    minHeight: 640,
    title:     'AnimeBill — Anime E-Bill Generator',
    icon:      path.join(__dirname, 'build', 'icon.png'),
    backgroundColor: '#f4f4f4',
    show: false, // Show after ready
    webPreferences: {
      nodeIntegration:  false,
      contextIsolation: true,
      webSecurity:      true,
    },
  });

  // Load the main HTML file
  mainWindow.loadFile('index.html');

  // Show window gracefully when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  // Open external links in system browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => { mainWindow = null; });
}

// ─── App Menu ───
function buildMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Generate New Bill',
          accelerator: 'CmdOrCtrl+N',
          click: () => mainWindow?.webContents.executeJavaScript('generateBill()'),
        },
        {
          label: 'Print Bill',
          accelerator: 'CmdOrCtrl+P',
          click: () => mainWindow?.webContents.executeJavaScript('printBill()'),
        },
        {
          label: 'Save as PNG',
          accelerator: 'CmdOrCtrl+S',
          click: () => mainWindow?.webContents.executeJavaScript('downloadPNG()'),
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Alt+F4',
          click: () => app.quit(),
        },
      ],
    },
    {
      label: 'Bill',
      submenu: [
        {
          label: 'Random Character 🎲',
          accelerator: 'CmdOrCtrl+R',
          click: () => mainWindow?.webContents.executeJavaScript('randomizeCharacter()'),
        },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload',        label: 'Reload' },
        { role: 'toggleDevTools',label: 'Developer Tools' },
        { type: 'separator' },
        { role: 'resetZoom',     label: 'Reset Zoom' },
        { role: 'zoomIn',        label: 'Zoom In',  accelerator: 'CmdOrCtrl+=' },
        { role: 'zoomOut',       label: 'Zoom Out', accelerator: 'CmdOrCtrl+-' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Full Screen' },
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'GitHub Repository',
          click: () => shell.openExternal('https://github.com/iprsnmsra/AnimeBill'),
        },
        {
          label: 'Open AnimeBill Online',
          click: () => shell.openExternal('https://animebill.vercel.app'),
        },
        { type: 'separator' },
        {
          label: 'About AnimeBill',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type:    'info',
              title:   'About AnimeBill',
              message: 'AnimeBill v1.0',
              detail:  'Anime-Themed E-Bill Generator\n\nMade with ❤️ by iprsnmsra\ngithub.com/iprsnmsra\n\n© 2026 AnimeBill. MIT License.',
              icon:    path.join(__dirname, 'build', 'icon.png'),
            });
          },
        },
      ],
    },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

// ─── App Lifecycle ───
app.whenReady().then(() => {
  buildMenu();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
