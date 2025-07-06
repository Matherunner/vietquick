const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("mainAPI", {
  searchTerm: (term) => ipcRenderer.invoke("searchTerm", term),
  onFinishLoad: (callback) =>
    ipcRenderer.on("finishLoad", (_event, value) => callback(value)),
});
