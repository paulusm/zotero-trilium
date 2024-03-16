# Zotero Trilium

A Zotero plugin to export references and notes to [Trilium Notes](https://github.com/zadam/trilium)

## Installation

Download the latest [release](https://github.com/paulusm/zotero-trilium/releases).

In Zotero, go to Tools > Add-ons. From the top right menu, choose Install Add-in from File and navigate to the location of the XPI file.

## Settings

Set in Zotero Tools > Zotero-Trilium menu

1. link to your Trilium server URL followed by /etapi for the API endpoint;
2. Your Trilium ETAPI key (set in the Options pages on Trilium)
3. The parent note where you want to add notes (get from the information icon on the note). This will be a string such as 49NkEIZgALHm

Two use cases so far working:

1. Right click on the main Zotero item to export the reference and library links;
2. Highlight your PDF in Zotero, then use "Add note from annotations". Right click the note and export to Trilium to create a new note with your annotations in it.

Known Issues:
* Zotero web URL link currently wrong
* Trilium does not properly hyperlink the Zotero protocol library link (but you can copy and paste it in your browser to go to the item in Zotero.)

## Acknowledgements

Forked initially from [mdnotes](https://argentinaos.com/zotero-mdnotes/)
MdNotes itself based and was inspired by [zotero-roam-export](https://github.com/melat0nin/zotero-roam-export/).
