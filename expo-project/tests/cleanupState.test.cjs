const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");
const ts = require("typescript");
const cache = new Map();
function load(name) {
  const file = path.resolve(__dirname, "../src/core", name + ".ts");
  if (cache.has(file)) return cache.get(file);
  const module = { exports: {} };
  cache.set(file, module.exports);
  vm.runInNewContext(
    ts.transpileModule(fs.readFileSync(file, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText,
    {
      module,
      exports: module.exports,
      require: (key) => load(path.basename(key)),
      Date,
      Math,
      Error,
      Set,
      Map,
      Promise,
    },
    { filename: file },
  );
  return module.exports;
}
const g = load("gallery"),
  { StateRepository, STATE_KEY } = load("persistence"),
  { LumaStore } = load("store");
const plain = (x) => JSON.parse(JSON.stringify(x));
const photo = (id, extra = {}) => ({
  id,
  uri: "file://" + id,
  filename: id + ".jpg",
  mediaType: "photo",
  width: 400,
  height: 300,
  creationTime: 1720000000000,
  modificationTime: 0,
  albumName: "Camera",
  source: "device",
  fileSize: 100,
  ...extra,
});
function setup() {
  const data = new Map(),
    calls = [];
  const storage = {
    async getItem(k) {
      return data.get(k) ?? null;
    },
    async setItem(k, v) {
      data.set(k, v);
    },
  };
  const repository = new StateRepository(storage);
  const store = new LumaStore(repository, async (items) => {
    calls.push(items);
    return { deletedIds: items.map((i) => i.id) };
  });
  return { store, repository, data, calls, storage };
}
test("keep-only completion records a real session and one daily streak; repeated finish is idempotent", async () => {
  const { store, repository } = setup();
  await store.load();
  store.start([photo("a"), photo("b")], "October");
  store.decide("a", "keep");
  store.decide("a", "delete");
  store.decide("b", "keep");
  await store.finish();
  await store.finish();
  await repository.flush();
  const s = store.getSnapshot().saved.device;
  assert.equal(s.stats.totalKept, 2);
  assert.equal(s.stats.totalDeleted, 0);
  assert.equal(s.stats.dailyStreak, 1);
  assert.equal(s.stats.cleanupLogs.length, 1);
  assert.equal(s.stats.cleanupLogs[0].keptCount, 2);
});

test("swipe acknowledgements reject stale, protected and busy callbacks without advancing progress", async () => {
  const { store, repository } = setup();
  await store.load();
  store.start([photo("a"), photo("b")], "October");
  store.bookmark("a");
  assert.equal(store.decide("a", "delete"), false);
  assert.equal(store.decide("a", "keep"), true);
  assert.equal(store.decide("a", "keep"), false);
  assert.equal(store.decide("wrong-id", "delete"), false);
  assert.equal(store.getSnapshot().saved.device.session.currentIndex, 1);
  store.undo();
  assert.equal(store.getSnapshot().saved.device.session.currentIndex, 0);
  assert.equal(store.decide("a", "delete"), false);
  await repository.flush();
  const other = setup();
  let confirm;
  const gated = new LumaStore(
    other.repository,
    () =>
      new Promise((resolve) => {
        confirm = resolve;
      }),
  );
  await gated.load();
  gated.start([photo("first"), photo("next")], "Camera");
  gated.decide("first", "delete");
  const deleting = gated.deleteSelected(
    [photo("first"), photo("next")],
    ["first"],
  );
  while (!confirm) await new Promise((resolve) => setImmediate(resolve));
  assert.equal(gated.decide("next", "keep"), false);
  confirm({ deletedIds: ["first"] });
  await deleting;
  assert.equal(gated.decide("next", "keep"), true);
});
test("decisions, last undo and bookmarks survive a new store instance", async () => {
  const { store, repository } = setup();
  await store.load();
  store.start([photo("a"), photo("b")], "October");
  store.decide("a", "delete");
  store.bookmark("b");
  await repository.flush();
  const restarted = new LumaStore(repository, async () => {
    throw Error("Must not delete");
  });
  await restarted.load();
  assert.deepEqual(
    plain(restarted.getSnapshot().saved.device.session.history),
    ["a"],
  );
  restarted.undo();
  assert.equal(restarted.getSnapshot().saved.device.session.currentIndex, 0);
  assert.deepEqual(plain(restarted.getSnapshot().saved.device.bookmarks), [
    "b",
  ]);
});
test("native confirmation is awaited, only confirmed IDs count, and bookkeeping cannot count twice", async () => {
  let resolve;
  const { repository } = setup();
  const store = new LumaStore(
    repository,
    () =>
      new Promise((done) => {
        resolve = done;
      }),
  );
  await store.load();
  const items = [photo("a"), photo("b", { fileSize: undefined })];
  store.start(items, "October");
  store.decide("a", "delete");
  store.decide("b", "delete");
  const pending = store.deleteSelected(items, ["a", "b"]);
  while (!resolve) await new Promise((done) => setImmediate(done));
  assert.equal(store.getSnapshot().saved.device.stats.totalDeleted, 0);
  assert.ok(store.getSnapshot().saved.deletionAttempt);
  resolve({ deletedIds: ["a"] });
  await pending;
  assert.equal(store.getSnapshot().saved.device.stats.totalDeleted, 1);
  let library = g.confirmDeleted(store.getSnapshot().saved.device, items, [
    "a",
  ]);
  assert.equal(library.stats.totalDeleted, 1);
  assert.deepEqual(plain(g.pendingIds(library.session)), ["b"]);
  library = g.confirmDeleted(library, items, ["b"]);
  assert.equal(library.stats.unknownSizeCount, 1);
  assert.equal(library.stats.bytesReclaimed, 100);
});
test("cancellation keeps marks and reports no savings", async () => {
  const { repository } = setup(),
    store = new LumaStore(repository, async () => ({
      deletedIds: [],
      error: "Cancelled",
    }));
  await store.load();
  store.start([photo("a")], "October");
  store.decide("a", "delete");
  await assert.rejects(store.deleteSelected([photo("a")], ["a"]), /Cancelled/);
  assert.equal(store.getSnapshot().saved.device.stats.totalDeleted, 0);
  assert.deepEqual(
    plain(g.pendingIds(store.getSnapshot().saved.device.session)),
    ["a"],
  );
});
test("bookmarks cannot be marked or submitted to deletion, including after a mark", async () => {
  const { store, calls } = setup();
  await store.load();
  store.start([photo("a")], "October");
  store.bookmark("a");
  store.decide("a", "delete");
  assert.equal(store.getSnapshot().saved.device.session.currentIndex, 0);
  store.bookmark("a");
  store.decide("a", "delete");
  store.bookmark("a");
  await store.deleteSelected([photo("a")], ["a"]);
  assert.equal(calls.length, 0);
  assert.equal(store.getSnapshot().saved.device.session.decisions.a, "keep");
});
test("legacy demo installs reopen only the device library without simulated receipts", async () => {
  const { store, data, calls } = setup();
  const legacy = g.initialState();
  legacy.mode = "demo";
  legacy.device.bookmarks = ["device-favorite"];
  legacy.demo.stats.totalDeleted = 12;
  legacy.demo.stats.bytesReclaimed = 900;
  legacy.deletionAttempt = { mode: "demo", sessionId: "old", ids: ["sample"] };
  data.set(STATE_KEY, JSON.stringify(legacy));
  await store.load();
  assert.equal(store.getSnapshot().saved.mode, "device");
  assert.equal(store.getSnapshot().saved.device.stats.totalDeleted, 0);
  assert.equal(store.getSnapshot().saved.device.stats.bytesReclaimed, 0);
  assert.equal(store.getSnapshot().saved.deletionAttempt, undefined);
  assert.deepEqual(plain(store.getSnapshot().saved.device.bookmarks), ["device-favorite"]);
  assert.throws(() => store.start([photo("sample", { source: "demo" })], "Samples"), /Only device gallery/);
  assert.equal(store.getSnapshot().saved.device.session, null);
  assert.equal(calls.length, 0);
  assert.equal(store.getSnapshot().saved.demo.stats.totalDeleted, 12); // Archived, never displayed or merged.
});
test("a failed intent save prevents native deletion and can be retried", async () => {
  const { store, storage, calls } = setup();
  await store.load();
  store.start([photo("a")], "October");
  store.decide("a", "delete");
  storage.setItem = async () => {
    throw Error("Disk full");
  };
  await assert.rejects(store.deleteSelected([photo("a")], ["a"]), /Disk full/);
  assert.equal(calls.length, 0);
  assert.match(store.getSnapshot().error, /could not be saved/);
  storage.setItem = async () => {};
  await store.retrySave();
  assert.equal(store.getSnapshot().error, "");
});
test("limited access never erases hidden saved bookmarks and cleanup decisions", () => {
  const library = g.emptyLibrary();
  library.bookmarks = ["hidden"];
  library.session = g.createSession(
    [photo("hidden")],
    "month",
    "month",
    "Month",
  );
  assert.deepEqual(
    plain(g.reconcileLibrary(library, [], false)),
    plain(library),
  );
});
test("collection completion reopens when a new original arrives; candidate unions use unique IDs", () => {
  const library = g.emptyLibrary();
  library.progress.a = "keep";
  assert.equal(g.collections([photo("a")], library)[0].isCompleted, true);
  assert.equal(
    g.collections([photo("a"), photo("b")], library)[0].isCompleted,
    false,
  );
});
test("migration retains original keys, old statistics, bookmarks and onboarding completion", async () => {
  const { data, repository } = setup();
  data.set(
    "@luma_user_stats_v2",
    JSON.stringify({ streak: 4, reclaimed: 1200, totalCleaned: 3 }),
  );
  data.set("@luma_onboarding_completed_v2", "true");
  data.set("@luma_native_bookmarks_v2", JSON.stringify(["old-favorite"]));
  const state = await repository.load();
  assert.equal(state.onboardingDone, true);
  assert.equal(state.device.stats.bytesReclaimed, 1200);
  assert.equal(state.device.stats.totalDeleted, 3);
  assert.deepEqual(plain(state.device.bookmarks), ["old-favorite"]);
  assert.ok(data.has("@luma_user_stats_v2"));
  assert.ok(data.has(STATE_KEY));
});
test("queued snapshots keep the latest decision when a previous write was delayed", async () => {
  const { storage, repository, data } = setup();
  const writes = [];
  const original = storage.setItem;
  storage.setItem = async (k, v) => {
    await new Promise((done) => setTimeout(done, 2));
    writes.push(JSON.parse(v).name);
    await original(k, v);
  };
  const state = g.initialState();
  const a = repository.save({ ...state, name: "First" }),
    b = repository.save({ ...state, name: "Second" });
  await Promise.all([a, b]);
  assert.deepEqual(writes, ["First", "Second"]);
  assert.equal(JSON.parse(data.get(STATE_KEY)).name, "Second");
});
test("unfinished deletion intent survives restart without creating an invented success receipt", async () => {
  const { data, repository } = setup(),
    state = g.initialState();
  state.deletionAttempt = { mode: "device", sessionId: "s", ids: ["a"] };
  await repository.save(state);
  const store = new LumaStore(repository, async () => {
    throw Error("Never auto delete");
  });
  await store.load();
  assert.equal(store.getSnapshot().interrupted, true);
  assert.equal(store.getSnapshot().saved.device.stats.totalDeleted, 0);
});

test("skipping an unavailable original never invents a keep or a deletion", async () => {
  const { store } = setup();
  await store.load();
  store.start([photo("unavailable"), photo("available")], "October");
  store.skipUnavailable("unavailable");
  assert.equal(
    store.getSnapshot().saved.device.session.mediaIds[0],
    "available",
  );
  store.decide("available", "keep");
  await store.finish();
  assert.equal(store.getSnapshot().saved.device.stats.totalKept, 1);
  assert.equal(store.getSnapshot().saved.device.stats.totalDeleted, 0);
});

test("failed session completion can be retried without double counting", async () => {
  const { store, storage, repository } = setup();
  await store.load();
  store.start([photo("a")], "October");
  store.decide("a", "keep");
  await repository.flush();
  storage.setItem = async () => {
    throw Error("Disk full");
  };
  await assert.rejects(store.finish(), /Disk full/);
  assert.ok(store.getSnapshot().saved.device.session);
  assert.equal(store.getSnapshot().saved.device.stats.totalKept, 0);
  storage.setItem = async () => {};
  await store.finish();
  assert.equal(store.getSnapshot().saved.device.stats.totalKept, 1);
});

test("missing native timestamps stay undated instead of inventing 1970 collections or anniversaries", () => {
  const undated = photo("undated", { creationTime: 0 });
  const stacks = g.collections([undated, photo("dated")], g.emptyLibrary());
  assert.equal(stacks[stacks.length - 1].key, "unknown-date");
  assert.equal(stacks[stacks.length - 1].title, "Date unavailable");
  assert.equal(
    g.onThisDay([undated], new Date(2026, 0, 1).getTime()).length,
    0,
  );
});

test("legacy sample bookmark metadata stays archived without touching device IDs", async () => {
  const { data, repository } = setup();
  data.set("@luma_demo_bookmarks_v2", JSON.stringify(["m-1", "m-5", "m-7"]));
  data.set("@luma_native_bookmarks_v2", JSON.stringify(["m-1"]));
  const state = await repository.load();
  assert.deepEqual(plain(state.demo.bookmarks), [
    "demo-1",
    "demo-18",
    "demo-8",
  ]);
  assert.deepEqual(plain(state.device.bookmarks), ["m-1"]);
});

test("onboarding waits for durable storage and failed completion stays retryable", async () => {
  const { store, storage, repository } = setup();
  await store.load();
  const original = storage.setItem;
  let release;
  storage.setItem = (key, value) => new Promise((resolve) => {
    release = async () => { await original(key, value); resolve(); };
  });
  const pending = store.onboard();
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(store.getSnapshot().saved.onboardingDone, false);
  await release();
  await pending;
  const restarted = new LumaStore(repository, async () => { throw Error("No deletion"); });
  await restarted.load();
  assert.equal(restarted.getSnapshot().saved.onboardingDone, true);

  const fresh = setup();
  await fresh.store.load();
  const write = fresh.storage.setItem;
  fresh.storage.setItem = async () => { throw Error("Disk full"); };
  await assert.rejects(fresh.store.onboard(), /Disk full/);
  assert.equal(fresh.store.getSnapshot().saved.onboardingDone, false);
  fresh.storage.setItem = write;
  await fresh.store.onboard();
  assert.equal(fresh.store.getSnapshot().saved.onboardingDone, true);
});
