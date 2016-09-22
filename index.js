const electron = require("electron");

require("electron-debug")();
require("electron-dl")();

electron.app.dock.hide();

const Size = {
	Arrow:   12,
	Width:  301,
	Height: 400,
};

const Shortcut = {
	Toggle: "CommandOrControl+Shift+Space",
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

		toggleBrowser(bounds);
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
		width:       Size.Width,
		height:      Size.Height + Size.Arrow,
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
	browser.setPosition(parseInt(bounds.x - (Size.Width / 2) + (bounds.width / 2)), bounds.y + Size.Arrow + 14);
	browser.show();

	tray.setHighlightMode("always");
}

function hideBrowser() {
	browser.hide();

	tray.setHighlightMode("never");

	electron.Menu.sendActionToFirstResponder("hide:");
}

function toggleBrowser(bounds) {
	if (browser.isVisible())
		hideBrowser();
	else
		showBrowser(bounds || tray.getBounds());
}

electron.ipcMain.on("hide-browser", (event, data) => {
	if (data)
		hideBrowser();
});

electron.app.on("ready", event => {
	createTray();
	createBrowser();

	electron.globalShortcut.register(Shortcut.Toggle, () => {
		toggleBrowser();
	});
});

electron.app.on("will-quit", event => {
	electron.globalShortcut.unregister(Shortcut.Toggle);
});
