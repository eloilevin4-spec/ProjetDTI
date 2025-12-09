const { contextBridge, ipcRenderer } = require('electron');

// Expose des fonctions spécifiques à partir d'Electron vers le processus de rendu (votre app React).
// Cela permet de ne pas exposer toutes les APIs de Node.js, ce qui est une bonne pratique de sécurité.
contextBridge.exposeInMainWorld('electronAPI', {
  sendNotification: (title, body) => {
    ipcRenderer.send('show-notification', title, body);
  },
});
