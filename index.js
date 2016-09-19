const electron = require("electron");

require("electron-debug")();
require("electron-dl")();

electron.app.dock.hide();

const size = {
	arrow:   12,
	width:  301,
	height: 400,
};

let tray = null;
let browser = null;

function createTray() {
	if (tray)
		return;

	tray = new electron.Tray(`${__dirname}/assets/Tray.png`);
	tray.on("click", (event, bounds) => {
		if (!browser)
			createBrowser();

		if (browser.isVisible())
			hideBrowser();
		else
			showBrowser(bounds);
	});
}

function createBrowser() {
	if (browser)
		return;

	const options = {
		show:        false,
		frame:       false,
		resizable:   false,
		transparent: true,
		width:       size.width,
		height:      size.height + size.arrow,
	}

	browser = new electron.BrowserWindow(options);
	browser.on("blur", hideBrowser);
	browser.webContents.on("new-window", (event, url) => {
		event.preventDefault();
		electron.shell.openExternal(url);
	});
	browser.loadURL(`file://${__dirname}/app/index.html`);
}

function showBrowser(bounds) {
	browser.setPosition(parseInt(bounds.x - (size.width / 2) + (bounds.width / 2)), bounds.y + size.arrow + 14);
	browser.show();

	tray.setHighlightMode("always");
}

function hideBrowser() {
	browser.hide();

	tray.setHighlightMode("never");
}

electron.app.on("ready", event => {
	createTray();
	createBrowser();
});
