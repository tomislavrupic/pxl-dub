#!/usr/bin/env python3
"""Create installable bundles and complete build source, each below the static asset limit."""
from pathlib import Path
import argparse,shutil,subprocess,tempfile,zipfile
parser=argparse.ArgumentParser();parser.add_argument('--native',required=True,type=Path);args=parser.parse_args()
native=args.native.resolve();site=Path(__file__).resolve().parents[1];downloads=site/'dist/downloads';downloads.mkdir(exist_ok=True)
version='0.4.0';juce=Path('/Users/thecore/Documents/00 Pixel Records Studio/Titty Tweeter/TittyTweeter/third_party/JUCE')
if (native/'third_party/JUCE').is_dir():juce=native/'third_party/JUCE'
with tempfile.TemporaryDirectory(prefix='download-',dir=native/'build') as temp:
 temp=Path(temp);binary=temp/f'PXL-Dub-{version}-macOS-arm64';binary.mkdir()
 for fmt,name in [('AU','PXL Dub.component'),('VST3','PXL Dub.vst3')]:
  (binary/fmt).mkdir();shutil.copytree(native/f'build/install-{version}'/fmt/name,binary/fmt/name,symlinks=True)
 shutil.copy2(native/'tools/Install.command',binary/'Install.command')
 for name in ['LICENSE','THIRD-PARTY-NOTICES.md']:shutil.copy2(native/name,binary/name)
 (binary/'READ ME.txt').write_text('PXL Dub0.4.0 — Pixel Records\n\nApple Silicon, macOS12+, AU and VST3 stereo instrument.\nUnzip, run Install.command, then rescan plugins in your DAW. Existing versions are backed up. Start the host transport, or turn Host Sync off and use Run.\n\nDuck is master kick depth; the Ducking tab has individual amounts for Chord, Pings, Bass, Percussion, Vinyl and Space. Kick stays full.\n\nLocal ad-hoc signed build; not notarized.\nCorresponding source and licenses: https://tomislavrupic.github.io/pxl-dub/#download\n')
 subprocess.run(['ditto','-c','-k','--keepParent',str(binary),str(downloads/(binary.name+'.zip'))],check=True)
 source=temp/f'PXL-Dub-{version}-source';source.mkdir()
 for p in native.iterdir():
  if p.name in {'.git','.superpowers','build','dist','.DS_Store'} or p.name.startswith('PXL-Dub-'):continue
  if p.is_dir():shutil.copytree(p,source/p.name,ignore=shutil.ignore_patterns('.DS_Store','__pycache__','JUCE'))
  else:shutil.copy2(p,source/p.name)
 juce_dest=source/'third_party/JUCE';juce_dest.mkdir()
 for p in juce.iterdir():
  if p.is_file():shutil.copy2(p,juce_dest/p.name)
 shutil.copytree(juce/'modules',juce_dest/'modules')
 shutil.copytree(juce/'extras/Build',juce_dest/'extras/Build')
 web=source/'web';web.mkdir()
 for p in site.iterdir():
  if p.name in {'.git','.openai','.DS_Store','node_modules'}:continue
  if p.is_dir():shutil.copytree(p,web/p.name,ignore=shutil.ignore_patterns('downloads','.DS_Store','__pycache__'))
  else:shutil.copy2(p,web/p.name)
 (source/'BUILD-SOURCE.md').write_text('PXL Dub0.4.0 corresponding source\n\nNative: macOS, Xcode command line tools and CMake3.25+. Run cmake -S . -B build -DCMAKE_BUILD_TYPE=Release then cmake --build build -j8. The exact JUCE8.0.14 modules, CMake files and helper-tool sources used by this build are included; unrelated JUCE examples/docs/assets are omitted. Licenses remain alongside the code.\n\nWeb: install the official WASI SDK34 for your OS, set WASI_SDK_PATH, then run web/tools/build-engine.sh. Serve web/dist with an HTTP server (localhost or HTTPS); file:// does not support AudioWorklet. Node is used for metadata and tests. No synth runtime dependencies or WASI imports are required.\n\nThe developer integration script tools/build_web.py assumes a sibling PXLDub-Web checkout; the standalone web build above is the source-package route.\n')
 archive=downloads/(source.name+'.zip')
 with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED,compresslevel=8) as z:
  for p in source.rglob('*'):
   if p.is_file() and p.name!='.DS_Store':z.write(p,str(Path(source.name)/p.relative_to(source)))
for p in downloads.glob('*.zip'):
 assert p.stat().st_size<25*1024**2,f'{p.name} exceeds hosting asset limit'
 with zipfile.ZipFile(p) as z:assert z.testzip() is None
 print(p.name,round(p.stat().st_size/1024**2,2),'MiB; CRC verified')
