ZoteroTrilium = {

  id: null,
	version: null,
	rootURI: null,
	initialized: false,
	addedElementIDs: [],
	
	init({ id, version, rootURI }) {
		if (this.initialized) return;
		this.id = id;
		this.version = version;
		this.rootURI = rootURI;
		this.initialized = true;
	},

  addToWindow(win) {
    let doc = win.document;
    win.MozXULElement.insertFTLIfNeeded('zotero-trilium.ftl');

    let menuseparator = doc.createXULElement('menuseparator');
		
    // Add menu option
    let export_item = doc.createXULElement('menuitem');
    export_item.id = 'zotero-trilium-menu-export-item-label';
    export_item.setAttribute('label','Export to Trilium');
    //export_item.setAttribute('data-l10n-id', 'zotero-trilium-menu-export-item-label');
    export_item.addEventListener('command', () =>
    {
      ZoteroTrilium.main();
    });

    let zotero_itemmenu = doc.getElementById('zotero-itemmenu');

    zotero_itemmenu.appendChild(menuseparator);
    zotero_itemmenu.appendChild(export_item);
  },

  addToAllWindows() {
		var windows = Zotero.getMainWindows();
		for (let win of windows) {
			if (!win.ZoteroPane) continue;
			this.addToWindow(win);
		}
	},

  getPref(pref_name) {
    return Zotero.Prefs.get(`extensions.zotero-trilium.${pref_name}`, true);
  },

  getParentItem(item) {
    let parentItem;

    if (item.isNote()) {
      parentItem = Zotero.Items.get(item.parentItemID);
    } else {
      parentItem = item;
    }

    return parentItem;
  },

  getZoteroLink(item){
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
    theLink = 'zotero://select/'+path+'/items/'+ item.key;
    theRet = '<a href="' + theLink + '">' + theLink + '</a>';
    return theRet;
  },

  getZoteroURI(item){
    var link

      link = Zotero.URI.getItemURI(item)
      // if (link.startsWith(ZOTERO_CONFIG.BASE_URI)) {
      //     link = (ZOTERO_CONFIG.WWW_BASE_URL +
      //             link.slice(ZOTERO_CONFIG.BASE_URI.length))
      // }
      return link;

  },


  async main(){
    var ps = Services.prompt;
    var items = Zotero.getActiveZoteroPane()
      .getSelectedItems()
      .filter(
        (item) => Zotero.ItemTypes.getName(item.itemTypeID) !== "attachment"
      );
    await Zotero.Schema.schemaUpdatePromise;
    Zotero.debug(items);
    var noteContent = '';
    var noteTitle = '';
    var noteParent = '';

    var item = items[0];
    noteParent = this.getParentItem(item);
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
      this.getZoteroLink(noteParent) + "<br/>" + this.getZoteroURI(noteParent);

    Zotero.debug(noteContent);
    

    const etapiToken = this.getPref('etapi-key');
    const etapiUrl = this.getPref('etapi-url') + '/create-note';
    const parentNote = this.getPref('parent-note-id');

    let rBody = `type=text&title=${noteTitle}&content=${noteContent}&parentNoteId=${parentNote}`;

    let rHeaders = { Authorization: `${etapiToken}`};
    let rOptions = { headers: rHeaders, body: rBody, timeout: 60000 };
    Zotero.debug(etapiUrl);
    let xhr;
      try {
        xhr = await Zotero.HTTP.request('POST', etapiUrl, rOptions);
      }
      catch (e) {
        Zotero.debug(e.message);
        ps.alert(null, "Zotero-Trilium", e.message);
      }

    if(xhr) Zotero.debug(xhr.status);
  
  },

  setPref(pref_name, value) {
    Zotero.Prefs.set(`extensions.zotero-trilium.${pref_name}`, value, true);
  },


  run(method, ...args) {
    this[method].apply(this, args).catch((err) => {
      Zotero.debug(err);
    });
  },


};