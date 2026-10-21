const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");
const ts = require("typescript");

function setup(refresh) {
  const timers = new Map();
  let id = 0;
  const file = path.join(__dirname, "../src/services/galleryRefresh.ts");
  const code = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(code, {
    module,
    exports: module.exports,
    setTimeout(fn) {
      timers.set(++id, fn);
      return id;
    },
    clearTimeout(key) {
      timers.delete(key);
    },
  });
  const queue = new module.exports.GalleryRefreshQueue(refresh);
  const tick = async () => {
    const callbacks = [...timers.values()];
    timers.clear();
    callbacks.forEach((fn) => fn());
    await new Promise((resolve) => setImmediate(resolve));
  };
  return { queue, timers, tick };
}

test("a burst of native changes schedules one reload; a disabled demo schedules none", async () => {
  let calls = 0;
  const { queue, timers, tick } = setup(async () => {
    calls++;
  });
  queue.request();
  assert.equal(timers.size, 0);
  queue.setEnabled(true);
  queue.request();
  queue.request();
  queue.request();
  assert.equal(timers.size, 1);
  await tick();
  assert.equal(calls, 1);
  queue.request();
  queue.setEnabled(false);
  await tick();
  assert.equal(calls, 1);
});

test("background changes and native/review prompts defer work until safe to refresh", async () => {
  let calls = 0;
  const { queue, timers, tick } = setup(async () => {
    calls++;
  });
  queue.setEnabled(true);
  queue.setActive(false);
  queue.request();
  assert.equal(timers.size, 0);
  queue.setActive(true);
  queue.setBlocked(true);
  await tick();
  assert.equal(calls, 0);
  queue.request();
  assert.equal(timers.size, 0);
  queue.setBlocked(false);
  await tick();
  assert.equal(calls, 1);
  queue.setActive(false);
  queue.setActive(true);
  await tick();
  assert.equal(calls, 2); // Permission changes in device Settings are rechecked on return.
});

test("events during a slow reload produce one follow-up without overlapping queries", async () => {
  let calls = 0,
    finish;
  const { queue, tick, timers } = setup(() => {
    calls++;
    return calls === 1
      ? new Promise((resolve) => {
          finish = resolve;
        })
      : Promise.resolve();
  });
  queue.setEnabled(true);
  queue.request();
  await tick();
  queue.request();
  queue.request();
  queue.request();
  assert.equal(calls, 1);
  assert.equal(timers.size, 0);
  finish();
  await new Promise((resolve) => setImmediate(resolve));
  await tick();
  assert.equal(calls, 2);
  await tick();
  assert.equal(calls, 2);
});

test("switching to demo cancels a queued follow-up and errors do not wedge later refreshes", async () => {
  let calls = 0,
    finish;
  const { queue, tick } = setup(() => {
    calls++;
    if (calls === 1)
      return new Promise((resolve) => {
        finish = resolve;
      });
    return Promise.reject(new Error("Permission changed"));
  });
  queue.setEnabled(true);
  queue.request();
  await tick();
  queue.request();
  queue.setEnabled(false);
  finish();
  await new Promise((resolve) => setImmediate(resolve));
  await tick();
  assert.equal(calls, 1);
  queue.setEnabled(true);
  queue.request();
  await tick();
  queue.request();
  await tick();
  assert.equal(calls, 3);
});
