/**
 * Copy source files to individual packages.
 */

import { copyFile } from 'node:fs/promises';

const base = 'packages';
const PACKAGES = [
  {
    pkg: 'my-map',
    paths: [
      'src/MyElement.js',
      'src/Options.js',
      'src/components/MyMapElement.js'
      // Deprecated: 'src/templates/my-map.tpl.html'
    ]
  }
];

PACKAGES.forEach(async ({ pkg, paths }) => {
  console.debug(`Copying ${paths.length} files for:`, pkg);

  await paths.forEach(async (path) => await copyFile(path, `${base}/${pkg}/${path}`));
});
