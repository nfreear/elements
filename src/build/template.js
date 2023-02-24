/**
 * Commandline: concatenate all the HTML templates into a single file.
 *
 * @copyright © Nick Freear, 31-March-2022.
 * @status experimental
 * @since 1.2.0
 * @file
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { URL } from 'url';

const LIMIT = 20; // 2;
const TPL_EXT = '.html';
const TPL_REGEX = /<template([^>]*)>(.*?)<\/template>/;

// const __filename = new URL('', import.meta.url).pathname;
// Will contain trailing slash
const __dirname = new URL('.', import.meta.url).pathname;

const INPUT_DIR = path.resolve(__dirname, '..', 'templates'); // @WAS: 'components'
const OUTPUT_FILE = path.resolve(__dirname, '../..', 'dist', 'template.html');

console.warn('Input Dir:', INPUT_DIR);

console.log('<!doctype html>');
console.log('<title>[my-templates]</title>');
console.log('<meta name="robots" content="noindex">');
console.log(`<build-time>${new Date().toISOString()}</build-time>`);

getHtmlTemplateFiles(INPUT_DIR).then(files => joinHtmlTemplateFiles(INPUT_DIR, files, OUTPUT_FILE));

// --------------------------------------------------------

async function joinHtmlTemplateFiles (dir, fileNames, outputFile) {
  const RE_OUTER = new RegExp(TPL_REGEX, 'msg');
  const RE_INNER = new RegExp(TPL_REGEX, 'ms');

  console.log(`<file-count>${fileNames.length}</file-count>`);

  await fileNames.forEach(async (file, fileIdx) => {
    if (fileIdx >= LIMIT) return;

    const BASE = path.basename(file, '.tpl.html');

    const FILE_PATH = path.resolve(dir, file);
    const CONTENT = await fs.readFile(FILE_PATH, 'utf8');

    const TEMPLATES = CONTENT.match(RE_OUTER);

    if (!TEMPLATES) throw new Error(`Templates not found in: ${file}`);

    console.log(`\n<!--\n** FILE ${fileIdx}: ${file}\n** -->\n`);

    TEMPLATES.forEach((template, idx) => {
      const MATCHES = template.match(RE_INNER);

      const ATTR = MATCHES ? MATCHES[1] : null;
      const TEMPLATE = MATCHES ? MATCHES[2] : null;

      const M_ID = ATTR ? ATTR.match(/id="(.+?)"/) : null;
      const ID = M_ID ? M_ID[1] : null;

      const TPL_ID = idx === 0 ? 'def' : (ID || idx);

      console.log(`<template id="${BASE}__${TPL_ID}">\n${TEMPLATE}\n</template>\n`);
    }); // End template.
  }); // End file.

  // console.log('<!-- END -->');
}

async function getHtmlTemplateFiles (dir) {
  const FILES = await fs.readdir(dir, { withFileTypes: false });

  return FILES.filter(file => path.extname(file) === TPL_EXT);
}
