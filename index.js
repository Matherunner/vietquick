const { app, BrowserWindow, WebContentsView } = require("electron");

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
  });
  win.on("resize", () => {
    const columnWidth = win.getSize()[0] / 3;
    view1.setBounds({
      x: 0,
      y: 0,
      width: columnWidth,
      height: win.getSize()[1],
    });
    view2.setBounds({
      x: columnWidth,
      y: 0,
      width: columnWidth,
      height: win.getSize()[1],
    });
    view3.setBounds({
      x: columnWidth * 2,
      y: 0,
      width: columnWidth,
      height: win.getSize()[1],
    });
  });

  const view1 = new WebContentsView();
  win.contentView.addChildView(view1);
  view1.webContents.loadURL(
    "https://tratu.coviet.vn/hoc-tieng-anh/tu-dien/lac-viet/V-A/ra.html"
  );
  view1.webContents.on("did-finish-load", async () => {
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
  view1.setBounds({ x: 0, y: 0, width: 400, height: 400 });

  const view2 = new WebContentsView();
  win.contentView.addChildView(view2);
  view2.webContents.loadURL("https://vdict.com/ra,2,0,0.html");
  view2.webContents.on("did-finish-load", async () => {
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
  view2.setBounds({ x: 400, y: 0, width: 400, height: 400 });

  const view3 = new WebContentsView();
  win.contentView.addChildView(view3);
  view3.webContents.loadURL("https://en.wiktionary.org/wiki/ra#Vietnamese");
  view3.webContents.on("did-finish-load", async () => {
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
  view3.setBounds({ x: 800, y: 0, width: 400, height: 400 });
};

app.whenReady().then(() => {
  createWindow();
});
