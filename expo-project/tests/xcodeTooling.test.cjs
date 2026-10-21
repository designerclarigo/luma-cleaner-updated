const assert = require('node:assert/strict');
const { test } = require('node:test');
const { createRequire } = require('node:module');

test('installed Xcode tooling generates unique 24-character project identifiers', () => {
  const project = require('xcode').project('test.pbxproj');
  project.hash = { project: { objects: {} } };
  const ids = new Set(Array.from({ length: 100 }, () => project.generateUuid()));
  assert.equal(ids.size, 100);
  for (const id of ids) assert.match(id, /^[A-F0-9]{24}$/);
});

test('ngrok’s scoped UUID override retains its CommonJS v4 API', () => {
  const fromNgrok = createRequire(require.resolve('@expo/ngrok/package.json'));
  const { v4 } = fromNgrok('uuid');
  assert.match(v4(), /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/);
  assert.doesNotThrow(() => fromNgrok('@expo/ngrok'));
});
