const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('db', {
    loadData: () => ipcRenderer.invoke('db-load'),
    saveData: (data) => ipcRenderer.invoke('db-save', data)
});
