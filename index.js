const { app, BrowserWindow, WebContentsView, ipcMain } = require("electron");
const path = require("node:path");

const setBounds = (size, views) => {
  const topHeight = 70;
  const columnWidth = size[0] / 3;
  const columnHeight = size[1] - topHeight;
  views[0].setBounds({
    x: 0,
    y: topHeight,
    width: columnWidth,
    height: columnHeight,
  });
  views[1].setBounds({
    x: columnWidth,
    y: topHeight,
    width: columnWidth,
    height: columnHeight,
  });
  views[2].setBounds({
    x: columnWidth * 2,
    y: topHeight,
    width: columnWidth,
    height: columnHeight,
  });
};

const createWindow = () => {
  ipcMain.handle("searchTerm", (event, term) => {
    view1.webContents.loadURL(
      `https://tratu.coviet.vn/hoc-tieng-anh/tu-dien/lac-viet/V-A/${term}.html`
    );
    view2.webContents.loadURL(`https://vdict.com/${term},2,0,0.html`);
    view3.webContents.loadURL(
      `https://en.wiktionary.org/wiki/${term}#Vietnamese`
    );
  });

  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });
  win.loadFile("public/index.html");
  win.removeMenu();
  win.on("resize", () => {
    setBounds(win.getContentSize(), [view1, view2, view3]);
  });

  const view1 = new WebContentsView();
  win.contentView.addChildView(view1);
  view1.webContents.loadURL(
    "https://tratu.coviet.vn/hoc-tieng-anh/tu-dien/lac-viet/V-A/ra.html"
  );
  view1.webContents.on("dom-ready", async () => {
    await view1.webContents.executeJavaScript(
      `
      (() => {
        const content = document.getElementById('divContent')
        const body = document.getElementsByTagName('body')[0]
        body.innerHTML = ''
        body.appendChild(content)
      })()
      `
    );
  });

  const view2 = new WebContentsView();
  win.contentView.addChildView(view2);
  view2.webContents.loadURL("https://vdict.com/ra,2,0,0.html");
  view2.webContents.on("dom-ready", async () => {
    await view2.webContents.executeJavaScript(
      `
      (() => {
        const audioBtn = document.getElementsByClassName('audio-player')[0]
        const content = document.getElementById("friendlyDefinition")
        const body = document.getElementsByTagName('body')[0]
        body.innerHTML = ''
        body.appendChild(audioBtn)
        body.appendChild(content)
      })()
      `
    );
  });

  const view3 = new WebContentsView();
  win.contentView.addChildView(view3);
  view3.webContents.loadURL("https://en.wiktionary.org/wiki/ra#Vietnamese");
  view3.webContents.on("dom-ready", async () => {
    await view3.webContents.executeJavaScript(
      `
      (() => {
        const inner = document.getElementById('mw-content-text').firstChild

        let state = 0
        const entries = []
        for (const child of inner.children) {
          if (state === 0) {
            if (child.firstChild && child.firstChild.id === 'Vietnamese') {
              state = 1
            }
          } else if (state === 1) {
            if (child.firstChild && child.firstChild.tagName === 'H2') {
              break
            }
            entries.push(child)
          }
        }

        const body = document.getElementsByTagName('body')[0]
        body.innerHTML = ''
        for (const entry of entries) {
          body.appendChild(entry)
        }

        window.scrollTo(0, 0)
      })()
      `
    );
  });

  setBounds(win.getContentSize(), [view1, view2, view3]);
};

app.whenReady().then(() => {
  createWindow();
});
