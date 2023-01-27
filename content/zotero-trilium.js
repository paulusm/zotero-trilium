/*globals Zotero, OS, require, Components, window */

function getPref(pref_name) {
  return Zotero.Prefs.get(`extensions.zotero-trilium.${pref_name}`, true);
}

function getParentItem(item) {
  let parentItem;

  if (item.isNote()) {
    parentItem = Zotero.Items.get(item.parentItemID);
  } else {
    parentItem = item;
  }

  return parentItem;
}

function getZoteroLink(item){
  var libraryType
  var path
  
  libraryType = Zotero.Libraries.get(item.libraryID).libraryType

  switch (libraryType) {
      case 'group':
          path = Zotero.URI.getLibraryPath(item.libraryID)
          break;
      case 'user':
          path = 'library'
          break;
  }
  return 'zotero://select/'+path+'/items/'+ item.key;
}

function getZoteroURI(item){
  var link

    link = Zotero.URI.getItemURI(item)
    if (link.startsWith(ZOTERO_CONFIG.BASE_URI)) {
        link = (ZOTERO_CONFIG.WWW_BASE_URL +
                link.slice(ZOTERO_CONFIG.BASE_URI.length))
    }
    return link;

}

Zotero.ZoteroTrilium =
  Zotero.ZoteroTrilium ||
  new (class {
    async openPreferenceWindow(paneID, action) {
      const io = {
        pane: paneID,
        action,
      };
      window.openDialog(
        "chrome://zotero-trilium/content/options.xul",
        "zotero-trilium-options",
        "chrome,titlebar,toolbar,centerscreen" +
          Zotero.Prefs.get("browser.preferences.instantApply", true)
          ? "dialog=no"
          : "modal",
        io
      );
    }

    async exportToTrilium(){
      var ps = Services.prompt;
      var items = Zotero.getActiveZoteroPane()
        .getSelectedItems()
        .filter(
          (item) => Zotero.ItemTypes.getName(item.itemTypeID) !== "attachment"
        );
      await Zotero.Schema.schemaUpdatePromise;

      var noteContent = '';
      var noteTitle = '';
      var noteParent = '';

      var item = items[0];
      noteParent = getParentItem(item);
      noteTitle = noteParent.getField("title");
      if (item && !item.isNote()) {
        Zotero.debug("Exporting a regular Zotero item");
      } else if (item && item.isNote()) {
        Zotero.debug("Exporting a Zotero note");    
        noteContent += item.getNote();
      } 

      // Add refs
      var style = Zotero.Styles.get('http://www.zotero.org/styles/apa');
		  var cslEngine = style.getCiteProc('en-GB', 'html');
      noteContent += encodeURIComponent(Zotero.Cite.makeFormattedBibliographyOrCitationList(cslEngine, [noteParent], "html")) +
         getZoteroLink(noteParent) + "<br/>" + getZoteroURI(noteParent);

      Zotero.debug(noteContent);
      

      const etapiToken = getPref('etapi_key');
      const etapiUrl = getPref('etapi_url') + '/create-note';
      const parentNote = getPref('parent_note_id');

      let rBody = `type=text&title=${noteTitle}&content=${noteContent}&parentNoteId=${parentNote}`;

      let rHeaders = { Authorization: `${etapiToken}`};
	    let rOptions = { headers: rHeaders, body: rBody, timeout: 60000 };

      let xhr;
        try {
          xhr = await Zotero.HTTP.request('POST', etapiUrl, rOptions);
        }
        catch (e) {
          Zotero.debug(e.message);
          ps.alert(null, "Zotero-Trilium", e.message);
        }

      if(xhr) Zotero.debug(xhr.status);
     
    }

    setPref(pref_name, value) {
      Zotero.Prefs.set(`extensions.zotero-trilium.${pref_name}`, value, true);
    }


    run(method, ...args) {
      this[method].apply(this, args).catch((err) => {
        Zotero.debug(err);
      });
    }
  })();
