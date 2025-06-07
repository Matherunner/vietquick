const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("mainAPI", {
  searchTerm: (term) => ipcRenderer.invoke("searchTerm", term),
});
