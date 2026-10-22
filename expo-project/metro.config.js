const { getDefaultConfig } = require('expo/metro-config');
const { createHash } = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const config = getDefaultConfig(__dirname);

// Windows can retain an obsolete file map while npm replaces SDK packages.
// Keep it local to this app and invalidate it after dependency or Node updates.
const dependencyKey = createHash('sha256')
  .update(fs.readFileSync(path.join(__dirname, 'package-lock.json')))
  .update(process.versions.node)
  .digest('hex')
  .slice(0, 20);
const fileMapCache = path.join(__dirname, '.expo', 'metro-file-map', dependencyKey);
fs.mkdirSync(fileMapCache, { recursive: true });
config.fileMapCacheDirectory = fileMapCache;
config.cacheVersion = `${config.cacheVersion || ''}:luma-${dependencyKey}`;

module.exports = config;
