var ZoteroTrilium;

function log(msg) {
	Zotero.debug("ZoteroTrilium: " + msg);
}

function install() {
	log("Installed 0.02");
}

async function startup({ id, version, rootURI }) {
	log("Starting 0.02");
	
	Zotero.PreferencePanes.register({
		pluginID: 'zotero-trilium@jellytussle.org',
		src: rootURI + 'preferences.xhtml',
		scripts: [rootURI + 'preferences.js']
	});
	
	Services.scriptloader.loadSubScript(rootURI + 'zotero-trilium.js');
	ZoteroTrilium.init({ id, version, rootURI });
	ZoteroTrilium.addToAllWindows();
	await ZoteroTrilium.main();
}

function onMainWindowLoad({ window }) {
	ZoteroTrilium.addToWindow(window);
}

function onMainWindowUnload({ window }) {
	ZoteroTrilium.removeFromWindow(window);
}

function shutdown() {
	log("Shutting down 0.02");
	ZoteroTrilium.removeFromAllWindows();
	ZoteroTrilium = undefined;
}

function uninstall() {
	log("Uninstalled 0.02");
}