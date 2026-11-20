// Leonida Trophy Guide — the hand-in program (Node 22, standard library only).
//
// The entry is plain static files: app/ is the guide itself (index.html, style.css,
// app.js and app/data/trophies.json), and screenshots/ holds the four real renders
// of it. This program copies both into the output directory and writes
// /output/dossier.json with the vendored make.fun library, which is the summary
// the judge reads. vendor/makefun-frontend.ts is the kit's copy, unchanged.
//
// Run it outside the grader with MAKEFUN_OUTPUT_DIR standing in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The caps match the scorer's own: at most 4 screenshots of at most 256 KiB each,
// at most 993 files and directories in app/ and 48 MiB of app files in all, and a
// dossier of at most 160 KiB of text. buildDossier refuses anything past them.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  }),
);
