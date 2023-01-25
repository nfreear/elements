/**
 * Collect meta-data about each custom element and MJS class.
 *
 * @copyright © Nick Freear, 12-Jan-2023.
 * @status experimental
 * @since 1.3.0
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { URL } from 'url';

const LIMIT = 40; // 10; // 2;
const MJS_EXT = '.js';

const __dirname = new URL('.', import.meta.url).pathname;

const INPUT_DIR = path.resolve(__dirname, '..', 'components');
const OUTPUT_FILE = path.resolve(__dirname, '..', '..', 'demo', 'index.json');

console.warn('Input Dir:', INPUT_DIR);

getJavascriptFiles(INPUT_DIR).then(files => parseJavascriptFiles(INPUT_DIR, files, OUTPUT_FILE));

async function parseJavascriptFiles (dir, fileNames, outputFile) {
  console.warn('File count:', fileNames.length);

  const PROMS = await fileNames.map(async (file, fileIdx) => {
    if (fileIdx >= LIMIT) return;

    // const BASE = path.basename(file, MJS_EXT);

    const FILE_PATH = path.resolve(dir, file);
    const INPUT = await fs.readFile(FILE_PATH, 'utf8');

    const DATA = {
      // Parse JSDoc comments.
      summary: matchAndGet(INPUT, /\*\*\n \* (.+)/),
      description: multiLineTrim(matchAndGet(INPUT, /\*\*\n \* ([^@]+)@/ms)), // WAS: /\*\*\n \* ([\w \n,!\.\*-]+)@/ms),
      date: matchAndGet(INPUT, /@copyright © [\w ]+, ([\w-]+-202\d)/),
      isoDate: null,
      since: matchAndGet(INPUT, /@since v?(\d\.\d.+)/),
      status: matchAndGet(INPUT, /@status (.+)/),
      todo: matchAndGet(INPUT, /@todo (.+)/i),
      demoUrl: matchAndGet(INPUT, /@see (https:\/\/codepen.io\/nfreear\/.+|..\/demo\/[\w-]+\.html)/),
      demoIsPen: !!matchAndGet(INPUT, /@see (https:\/\/codepen.io\/nfreear\/.+)/),
      // Parse Javascript code.
      className: matchAndGet(INPUT, /class (\w+) extends/),
      parentClass: matchAndGet(INPUT, /extends (\w+) \{/),
      tagName: matchAndGet(INPUT, /getTag \(\) \{\n\s+return '([\w-]+)'/ms),
      extTemplate: matchAndGet(INPUT, / {2}await this.getTemplate\('([\w-]+)/),
      hasIntTemplate: !!matchAndGet(INPUT, /(this._attachLocalTemplate)/)
    };

    DATA.isoDate = DATA.date ? new Date(DATA.date).toISOString().replace(/T.+/, '') : null;

    // console.log('Data:', file, DATA);

    return DATA;
  });

  const items = await Promise.all(PROMS);

  console.log(JSON.stringify({ items }, null, 2));

  return items;
}

async function getJavascriptFiles (dir) {
  const FILES = await fs.readdir(dir, { withFileTypes: false });

  return FILES.filter(file => path.extname(file) === MJS_EXT);
}

function matchAndGet (input, regex, idx = 1) {
  const MATCHES = input.match(regex);
  return MATCHES ? MATCHES[idx] : null;
}

function multiLineTrim (inputStr) {
  return inputStr.replace(/[\n *]+$/, '').replace(/\n \*/g, '\n');
}
