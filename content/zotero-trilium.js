/*globals Zotero, OS, require, Components, window */


function getPref(pref_name) {
  return Zotero.Prefs.get(`extensions.zotero-trilium.${pref_name}`, true);
}


function getDateAdded(item) {
 const date = new Date(item.getField("dateAdded"));
 return simpleISODate(date)
}

function getCiteKey(item) {
  if (typeof Zotero.BetterBibTeX === "object" && Zotero.BetterBibTeX !== null) {
    var bbtItem = Zotero.BetterBibTeX.KeyManager.get(item.getField("id"));
    return bbtItem.citekey;
  }

  return "undefined";
}

function getLocalZoteroLink(item) {
  let linksString = "zotero://select/items/";
  const library_id = item.libraryID ? item.libraryID : 0;
  linksString += `${library_id}_${item.key}`;

  return linksString;
}

function getCloudZoteroLink(item) {
  return `${Zotero.URI.getItemURI(item)}`;
}

function getDOI(item) {
  let doi = item.getField("DOI");
  if (doi) {
    return `[${doi}](https://doi.org/${doi})`;
  } else {
    return doi;
  }
}

function getURL(item) {
  let url = item.getField("url");
  if (url) {
    return `[${url}](${url})`;
  } else {
    return url;
  }
}

function getTags(item) {
  const tagsArray = [];
  var itemTags = item.getTags();

  if (itemTags) {
    for (const tag of itemTags) {
      tagsArray.push(tag.tag);
    }
  }

  return tagsArray;
}

function getCollectionNames(item) {
  const collectionArray = [];
  var collections = item.getCollections();

  for (let collectionID of collections) {
    var collection = Zotero.Collections.get(collectionID);
    collectionArray.push(collection.name);
  }

  return collectionArray;
}


function getCreatorArray(item, creatorType) {
  var creators = item.getCreators();
  var creatorTypeID = Zotero.CreatorTypes.getID(creatorType);
  var creatorArray = [];

  if (creators) {
    for (let creator of creators) {
      if (creator.creatorTypeID === creatorTypeID) {
        let creatorName = `${creator.firstName} ${creator.lastName}`;
        creatorArray.push(creatorName);
      }
    }
  }
  return creatorArray;
}

function getItemMetadata(item) {
  let metadata = {};
  let fields = Zotero.ItemFields.getItemTypeFields(item.getField("itemTypeID"));
  var zoteroType = Zotero.ItemTypes.getName(item.getField("itemTypeID"));
  let creatorTypes = Zotero.Utilities.getCreatorsForType(zoteroType);

  for (let creatorType of creatorTypes) {
    let creatorArray = getCreatorArray(item, creatorType);
    metadata[creatorType] = creatorArray;
  }

  for (let x of fields) {
    let field = Zotero.ItemFields.getName(x);
    let content = item.getField(field, false, true);
    if (field === "DOI") {
      content = getDOI(item);
    } else if (field === "url") {
      content = getURL(item);
    } else if (field === "dateAdded") {
      content = simpleISODate(content);
    }
    metadata[field] = content;
  }
  metadata.itemType = typemap[zoteroType];
  metadata.citekey = getCiteKey(item);
  metadata.collections = getCollectionNames(item);
  metadata.related = getRelatedItems(item);
  metadata.tags = getTags(item);
  metadata.pdfAttachments = getZoteroAttachments(item);
  metadata.localLibrary = getLocalZoteroLink(item);
  metadata.cloudLibrary = getCloudZoteroLink(item);
  metadata.dateAdded = getDateAdded(item);
  metadata.notes = getZoteroNoteTitles(item);
  metadata.mdnotesFileName = getMDNoteFileName(item);
  metadata.metadataFileName = getZMetadataFileName(item);

  return metadata;
}

function formatInternalLink(content, linkStyle) {
  linkStyle =
    typeof linkStyle !== "undefined" ? linkStyle : getPref("link_style");

  if (linkStyle === "wiki") {
    return `[[${content}]]`;
  } else if (linkStyle === "markdown") {
    return `[${content}](${lowerCaseDashTitle(content)})`;
  } else {
    return `${content}`;
  }
}

function lowerCaseDashTitle(content) {
  return content.replace(/\s+/g, "-").toLowerCase();
}

function getZoteroNotes(item) {
  var noteIDs = item.getNotes();
  var noteArray = [];

  if (noteIDs) {
    for (let noteID of noteIDs) {
      let note = Zotero.Items.get(noteID);
      noteArray.push(note);
    }
  }

  return noteArray;
}

function getZoteroPDFLink(attachment) {
  return `zotero://open-pdf/library/items/${attachment.key}`;
}

function getPDFFileLink(attachment) {
  let fileLink = Zotero.File.pathToFileURI(attachment.getFilePath());
  return fileLink;
}

function getZoteroAttachments(item) {
  const linkStylePref = getPref("pdf_link_style");
  let attachmentIDs = item.getAttachments();
  var linksArray = [];
  for (let id of attachmentIDs) {
    let attachment = Zotero.Items.get(id);
    if (attachment.attachmentContentType == "application/pdf") {
      let link;
      if (linkStylePref === "zotero") {
        link = `[${attachment.getField("title")}](${getZoteroPDFLink(attachment)})`;
      } else if (linkStylePref === "wiki") {
        link = formatInternalLink(attachment.getField("title"), "wiki");
      } else {
        link = `[${attachment.getField("title")}](${getPDFFileLink(attachment)})`;
      }
      linksArray.push(link);
    }
  }
  return linksArray;
}

// Hacky solution from https://stackoverflow.com/a/25047903
var isDate = function (date) {
  return new Date(date).toString() !== "Invalid Date" && !isNaN(new Date(date));
};

// From https://stackoverflow.com/a/29774197
// Return the date in yyyy-mm-dd format
function simpleISODate(date) {
  const offset = date.getTimezoneOffset();
  date = new Date(date.getTime() + offset * 60 * 1000);
  return date.toISOString().split("T")[0];
}

function formatNoteTitle(titleString) {
  var strInParenthesis = titleString.match(/\(([^\)]+)\)/g);

  if (!strInParenthesis) {
    // Just replace all slashes and colons with dashes
    return titleString.replace(/\/|:/g, "-");
  } else {
    var dateInParenthesis = strInParenthesis[0].replace(/\(|\)/g, "");

    if (isDate(dateInParenthesis)) {
      var date = new Date(dateInParenthesis);
      return titleString.replace(dateInParenthesis, simpleISODate(date));
    } else {
      return titleString;
    }
  }
}


/**
 * Return file names for an array of notes based on the naming convention
 *
 * @param {object} item A Zotero item
 */
function getZoteroNoteTitles(item) {
  let noteTitleArray = [];
  let noteArray = getZoteroNotes(item);

  for (let note of noteArray) {
    let noteFileName = getZNoteFileName(note);
    noteTitleArray.push(noteFileName);
  }

  return noteTitleArray;
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

    updateMenus() {
      // Follow Zotfile's example:
      // https://github.com/jlegewie/zotfile/blob/master/chrome/content/zotfile/ui.js#L190
      let win = Services.wm.getMostRecentWindow("navigator:browser");
      let menu = win.ZoteroPane.document.getElementById("id-mdnotes-menupopup");

      // This is the order in which menuitems are added in overlay.xul
      let items = {
        mdexport: 0,
        separator: 1,
        single: 2,
        batch: 3,
        mdnotes: 4,
        standalone: 5,
      };

      let disableItems = [];

      if (getPref("file_conf") === "split") {
        disableItems.push(items.single);
      } else {
        disableItems.push(items.batch);
        disableItems.push(items.mdnotes);
      }

      if (!getPref("standalone_menu")) {
        disableItems.push(items.standalone)
      }

      // Enable all items by default and make them visible
      for (let i = 0; i < menu.childNodes.length; i++) {
        menu.childNodes[i].setAttribute("disabled", false);
        menu.childNodes[i].setAttribute("hidden", false);
      }

      // Hide and disable menus based on the single vs split files
      for (let i in disableItems) {
        menu.childNodes[disableItems[i]].setAttribute("disabled", true);
        menu.childNodes[disableItems[i]].setAttribute("hidden", true);
      }
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
