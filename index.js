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

const focusInput = (win) => {
  win.webContents.focus();
  win.webContents.send("finishLoad");
};

const createWindow = () => {
  ipcMain.handle("searchTerm", (event, term) => {
    view1.webContents.loadURL(
      `https://tracau.vn/?s=${encodeURIComponent(term)}`
    );
    view2.webContents.loadURL(
      `https://vtudien.com/viet-trung/dictionary/nghia-cua-tu-${encodeURIComponent(
        term
      )}`
    );
    view3.webContents.loadURL(
      `https://en.wiktionary.org/wiki/${encodeURIComponent(term)}#Vietnamese`
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
  view1.webContents.loadURL("https://tracau.vn/?s=an%20to%C3%A0n");
  view1.webContents
    .on("dom-ready", async () => {
      await view1.webContents.executeJavaScript(
        `
      (() => {
        const content = document.getElementById('ve')
        const body = document.getElementsByTagName('body')[0]
        body.innerHTML = ''
        body.appendChild(content)
      })()
      `
      );
    })
    .on("did-finish-load", () => {
      focusInput(win);
    });

  const view2 = new WebContentsView();
  win.contentView.addChildView(view2);
  view2.webContents.loadURL(
    "https://vtudien.com/viet-trung/dictionary/nghia-cua-tu-an%20to%C3%A0n"
  );
  view2.webContents
    .on("dom-ready", async () => {
      await view2.webContents.executeJavaScript(
        `
      (() => {
        const content = document.getElementById('idnghia')
        const body = document.getElementsByTagName('body')[0]
        body.innerHTML = ''
        body.appendChild(content)

        const elems = document.querySelectorAll('[id^="aswift_"]')
        for (const elem of elems) {
          elem.remove()
        }
      })()
      `
      );
    })
    .on("did-finish-load", () => {
      focusInput(win);
    });

  const view3 = new WebContentsView();
  win.contentView.addChildView(view3);
  view3.webContents.loadURL("https://en.wiktionary.org/wiki/an_to%C3%A0n");
  view3.webContents
    .on("dom-ready", async () => {
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
    })
    .on("did-finish-load", () => {
      focusInput(win);
    });

  setBounds(win.getContentSize(), [view1, view2, view3]);
};

app.whenReady().then(() => {
  createWindow();
});
