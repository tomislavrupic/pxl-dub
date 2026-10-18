#!/bin/bash
set -euo pipefail
: "${WASI_SDK_PATH:?Set WASI_SDK_PATH to wasi-sdk-34.0-arm64-macos (or the matching toolchain for your OS)}"
PXL_WEB_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
python3 - "$PXL_WEB_ROOT" "$WASI_SDK_PATH" <<'PY'
import sys,re,subprocess
from pathlib import Path
root,sdk=map(Path,sys.argv[1:]);source=root/'engine/Source/WebBridge.cpp'
exports=list(dict.fromkeys(re.findall(r'\b(dub_\w+)\(',source.read_text())))
cmd=[str(sdk/'bin/clang++'),'-std=c++17','-O2','-ffp-contract=off','-fno-exceptions','-fno-rtti','-DEN_HOST','-nostartfiles','-Wl,--no-entry','-Wl,--export=__wasm_call_ctors','-Wl,--export-memory','-Wl,--initial-memory=16777216','-Wl,--max-memory=16777216','-Wl,-z,stack-size=1048576']+[f'-Wl,--export={x}' for x in exports]+[str(source),'-o',str(root/'dist/engine.wasm')]
subprocess.run(cmd,check=True)
PY
node "$PXL_WEB_ROOT/tools/metadata.mjs"
