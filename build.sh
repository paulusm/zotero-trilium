#!/bin/bash
set -euo pipefail

rm -rf build
mkdir build

cd src
zip -r ../build/zotero-trilium-1.0.xpi *
