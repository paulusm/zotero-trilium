all: Makefile.in

-include Makefile.in

# RELEASE:=$(shell grep em:version install.rdf | head -n 1 | sed -e 's/ *<em:version>//' -e 's/<\/em:version>//')
RELEASE:=0.0.2
PREVRELEASE:=0.0.1

zotero-trilium.xpi: FORCE
	rm -rf $@
	yarn build
	zip -r $@ content chrome.manifest defaults locale skin install.rdf update.rdf -x \*.DS_Store

zotero-trilium-%.xpi: zotero-trilium.xpi
	mv $< $@

Makefile.in: install.rdf
	echo "all: zotero-trilium-${RELEASE}.xpi" > Makefile.in

release: zotero-trilium.xpi
	@mv $< zotero-trilium-$(RELEASE).xpi
	# Replace old version with new version in install.rdf and update.rdf
	#sed -i 's/${PREVRELEASE}/${RELEASE}/g' install.rdf
	#sed -i 's/${PREVRELEASE}/${RELEASE}/g' update.rdf
	# Show commits between the last two tags
	# @echo "\nChangelog\n------------"
	#@git log --pretty=format:"%s" $(PREVRELEASE)..$(RELEASE) > changelog.md

clean:
	rm -rf *.xpi

FORCE:
