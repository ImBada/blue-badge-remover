/**
 * Firefox build script
 *
 * Copies the Chrome build output (dist/) to dist-firefox/ and patches the
 * manifest to make it Firefox-compatible:
 *   - Removes `unlimitedStorage` permission (unsupported in Firefox MV3)
 *   - Adds `browser_specific_settings` with gecko ID and minimum version
 */

import { cpSync, readFileSync, writeFileSync } from 'fs';

const SRC = 'dist';
const DEST = 'dist-firefox';

// Copy Chrome build output
cpSync(SRC, DEST, { recursive: true, force: true });

// Patch the manifest
const manifest = JSON.parse(readFileSync(`${DEST}/manifest.json`, 'utf8'));

manifest.permissions = (manifest.permissions ?? []).filter(
  (p) => p !== 'unlimitedStorage',
);

manifest.browser_specific_settings = {
  gecko: {
    id: 'blue-badge-remover@fotoner-p',
    strict_min_version: '128.0',
  },
};

writeFileSync(`${DEST}/manifest.json`, JSON.stringify(manifest, null, 2));

console.log(`Firefox build complete → ${DEST}/`);
