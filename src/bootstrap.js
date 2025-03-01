var ZoteroTrilium;

function log(msg) {
	Zotero.debug("ZoteroTrilium: " + msg);
}

function install() {
	log("Installed ZT");
}

async function startup({ id, version, rootURI }) {
	log("Startup ZT");
	
	Zotero.PreferencePanes.register({
		id: 'zotero-trilium',
		pluginID: 'zotero-trilium@jellytussle.org',
		src: rootURI + 'prefs.xul'
		//scripts: [rootURI + 'prefs.js'],
	});
	
	Services.scriptloader.loadSubScript(rootURI + 'zotero-trilium.js');
	ZoteroTrilium.init({ id, version, rootURI });
	ZoteroTrilium.addToAllWindows();
}

function onMainWindowLoad({ window }) {
	log("Window Load ZT");
	ZoteroTrilium.addToWindow(window);
}

function onMainWindowUnload({ window }) {
	
}

function shutdown() {
	log("Shutting down ZT");
	ZoteroTrilium = undefined;
}

function uninstall() {
	log("Uninstalled ZT");
}