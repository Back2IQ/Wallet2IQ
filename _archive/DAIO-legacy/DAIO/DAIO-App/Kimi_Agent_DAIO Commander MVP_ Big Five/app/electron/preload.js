const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  saveData: (key, data) => ipcRenderer.invoke('save-data', key, data),
  loadData: (key) => ipcRenderer.invoke('load-data', key),
  exportPdf: (htmlContent, filename) => ipcRenderer.invoke('export-pdf', htmlContent, filename),
  
  // Platform info
  platform: process.platform,
  versions: {
    node: process.versions.node,
    electron: process.versions.electron
  }
});
