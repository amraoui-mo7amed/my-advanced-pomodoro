const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('db', {
  saveProjects: (projects) => ipcRenderer.invoke('save-projects', projects),
  loadProjects: () => ipcRenderer.invoke('load-projects')
});

contextBridge.exposeInMainWorld('electronAPI', {
  notify: (title, body) => ipcRenderer.send('notify', { title, body })
});
