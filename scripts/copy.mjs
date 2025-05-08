/**
 * Copy source files to individual packages.
 */

import { copyFile, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
// import packagesData from './packages.json' with { type: 'json' };

const { base, packages } = await readJsonFile('packages.json');

packages.forEach(async ({ id }) => {
  const { files } = await readJsonFile('..', base, id, 'package.json');
  const paths = files.filter(file => !/^!/.test(file));

  console.debug(`Copying ${paths.length} files for:`, id, paths);

  await paths.forEach(async (path) => await copyFile(path, `${base}/${id}/${path}`));
});

async function readJsonFile (...pathParts) {
  const filePath = resolvePath(...pathParts);
  const json = await readFile(filePath, 'utf8');
  return JSON.parse(json);
}

function resolvePath (...params) {
  const __dirname = import.meta.dirname;
  return resolve(__dirname, ...params);
}
