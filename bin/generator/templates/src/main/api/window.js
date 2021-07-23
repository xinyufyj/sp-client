import { ipcMain, BrowserWindow, app } from "electron";

ipcMain.on("window-minimize", minimize);
ipcMain.on("window-maximize", maximize);
ipcMain.on("window-close", closeWindow);
ipcMain.handle('window-getMaximize', async (event, opt) => {
  return BrowserWindow.getFocusedWindow().isMaximized();
})

function getMainWindow() {
  let wins = BrowserWindow.getAllWindows();
  let mianWin = null;
  if(wins && wins.length > 0) {
    try {
      mianWin = wins.reduce(function (p, v) {
        return ( p.id < v.id ? p : v );
      });
    } catch (error) {
      console.log(error);
    }
  }
  return mianWin;
}

function minimize(event) {
  let win = null
  if(win = getMainWindow()) {
    win.minimize();
  }
}

function maximize(event) {
  let win = null
  if(win = getMainWindow()) {
    if (win.isMaximized()) {
      win.restore();
    } else {
      win.maximize();
    }
  }
}

function closeWindow(event) {
  let win = getMainWindow();
  if(win) {
    win.destroy();
  }
  app.quit();
}