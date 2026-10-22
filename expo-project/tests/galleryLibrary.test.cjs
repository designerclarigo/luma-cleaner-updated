const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");
const ts = require("typescript");

const file = path.join(__dirname, "../src/services/galleryLibrary.ts");
const code = ts.transpileModule(fs.readFileSync(file, "utf8"), {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;
const moduleObject = { exports: {} };
vm.runInNewContext(
  code,
  { module: moduleObject, exports: moduleObject.exports, Error },
  { filename: file },
);
const { GalleryLibrary } = moduleObject.exports;
const plain = (value) => JSON.parse(JSON.stringify(value));
const real = { id: "device-photo", source: "device" };
const full = { granted: true, accessPrivileges: "all", canAskAgain: true };
function setup(platform = "android") {
  const calls = [];
  const driver = {
    getPermissions: async () => {
      calls.push("check");
      return full;
    },
    requestPermissions: async () => {
      calls.push("request");
      return full;
    },
    getAssets: async (options) => {
      calls.push(options);
      return { assets: [real], hasNextPage: false };
    },
  };
  return {
    driver,
    calls,
    gallery: new GalleryLibrary(driver, platform),
  };
}

test("starts empty in device mode and never loads samples on denial", async () => {
  const { gallery, driver, calls } = setup();
  assert.equal(gallery.getSnapshot().mode, "device");
  assert.deepEqual(plain(gallery.getSnapshot().media), []);
  driver.getPermissions = async () => ({
    granted: false,
    accessPrivileges: "none",
    canAskAgain: false,
  });
  await gallery.load();
  assert.equal(gallery.getSnapshot().status, "permission");
  assert.equal(gallery.getSnapshot().canAskAgain, false);
  assert.deepEqual(plain(gallery.getSnapshot().media), []);
  assert.deepEqual(calls, []);
});

test("empty device library remains empty and does not become a demo", async () => {
  const { gallery, driver } = setup();
  driver.getAssets = async () => ({ assets: [], hasNextPage: false });
  await gallery.load();
  assert.equal(gallery.getSnapshot().status, "empty");
  assert.equal(gallery.getSnapshot().mode, "device");
  assert.deepEqual(plain(gallery.getSnapshot().media), []);
});

test("permission and loading failures show errors and clear previously loaded media", async () => {
  for (const boundary of ["getPermissions", "getAssets"]) {
    const { gallery, driver } = setup();
    await gallery.load();
    assert.equal(gallery.getSnapshot().media[0].id, real.id);
    driver[boundary] = async () => {
      throw new Error("Native access unavailable");
    };
    await gallery.load();
    assert.equal(gallery.getSnapshot().status, "error");
    assert.match(gallery.getSnapshot().message, /Native access unavailable/);
    assert.deepEqual(plain(gallery.getSnapshot().media), []);
  }
});

test("web reports native gallery unavailable without invoking native APIs", async () => {
  const { gallery, calls } = setup("web");
  await gallery.load(true);
  assert.equal(gallery.getSnapshot().status, "unsupported");
  assert.deepEqual(calls, []);
  assert.deepEqual(plain(gallery.getSnapshot().media), []);
});

test("sample mode has no entry point; device galleries start empty", () => {
  const { gallery } = setup();
  assert.equal(typeof gallery.useDemo, "undefined");
  assert.equal(gallery.getSnapshot().mode, "device");
  assert.deepEqual(plain(gallery.getSnapshot().media), []);
});

test("a stale native response cannot replace a newer permission denial", async () => {
  const { gallery, driver } = setup();
  let finish;
  let entered;
  const started = new Promise((resolve) => {
    entered = resolve;
  });
  driver.getAssets = () =>
    new Promise((resolve) => {
      finish = resolve;
      entered();
    });
  const loading = gallery.load();
  await started;
  driver.getPermissions = async () => ({ granted: false, canAskAgain: false });
  await gallery.load();
  finish({ assets: [real], hasNextPage: false });
  await loading;
  assert.equal(gallery.getSnapshot().mode, "device");
  assert.equal(gallery.getSnapshot().status, "permission");
  assert.deepEqual(plain(gallery.getSnapshot().media), []);
});

test("supports limited access, explicit permission requests and pagination without duplicates", async () => {
  const { gallery, driver, calls } = setup();
  driver.requestPermissions = async () => {
    calls.push("request");
    return { granted: false, accessPrivileges: "limited", canAskAgain: true };
  };
  driver.getAssets = async ({ after }) =>
    after
      ? { assets: [real, { id: "second-photo" }], hasNextPage: false }
      : { assets: [real], hasNextPage: true, endCursor: "100" };
  await gallery.load(true);
  assert.deepEqual(calls, ["request"]);
  assert.equal(gallery.getSnapshot().limited, true);
  assert.equal(gallery.getSnapshot().status, "ready");
  assert.deepEqual(plain(gallery.getSnapshot().media.map((item) => item.id)), [
    "device-photo",
    "second-photo",
  ]);
  assert.ok(
    gallery.getSnapshot().media.every((item) => item.source === "device"),
  );
});

test("unreadable assets and invalid cursors are reported without a sample fallback", async () => {
  for (const page of [
    { assets: [], unavailableCount: 2, hasNextPage: false },
    { assets: [real], hasNextPage: true },
    { assets: [real], hasNextPage: true, endCursor: "same" },
  ]) {
    const { gallery, driver } = setup();
    driver.getAssets = async () => page;
    await gallery.load();
    assert.equal(gallery.getSnapshot().status, "error");
    assert.deepEqual(plain(gallery.getSnapshot().media), []);
  }
});

test("refresh retains the active catalog until a complete new catalog is ready", async () => {
  const { gallery, driver } = setup();
  await gallery.load();
  let finish;
  driver.getAssets = () =>
    new Promise((resolve) => {
      finish = resolve;
    });
  const pending = gallery.load();
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(gallery.getSnapshot().status, "ready");
  assert.equal(gallery.getSnapshot().refreshing, true);
  assert.deepEqual(plain(gallery.getSnapshot().media), [real]);
  finish({
    assets: [{ id: "new-video", mediaType: "video" }],
    hasNextPage: false,
  });
  await pending;
  assert.equal(gallery.getSnapshot().refreshing, false);
  assert.deepEqual(plain(gallery.getSnapshot().media.map((i) => i.id)), [
    "new-video",
  ]);
});

test("permission revocation clears cached originals without replacing them with demo media", async () => {
  const { gallery, driver } = setup();
  await gallery.load();
  driver.getPermissions = async () => ({
    granted: false,
    canAskAgain: false,
    accessPrivileges: "none",
  });
  await gallery.load();
  assert.equal(gallery.getSnapshot().status, "permission");
  assert.equal(gallery.getSnapshot().granted, false);
  assert.equal(gallery.getSnapshot().refreshing, false);
  assert.deepEqual(plain(gallery.getSnapshot().media), []);
});

test("a reload started before confirmed deletion cannot reintroduce deleted originals", async () => {
  const { gallery, driver } = setup();
  await gallery.load();
  let finish;
  driver.getAssets = () =>
    new Promise((resolve) => {
      finish = resolve;
    });
  const pending = gallery.load();
  await new Promise((resolve) => setImmediate(resolve));
  gallery.removeDeleted([real.id]);
  finish({ assets: [real], hasNextPage: false });
  await pending;
  assert.equal(gallery.getSnapshot().status, "empty");
  assert.equal(gallery.getSnapshot().refreshing, false);
  assert.deepEqual(plain(gallery.getSnapshot().media), []);
});

test("first page becomes usable while the rest of a large gallery is loading", async () => {
  const { gallery, driver } = setup();
  let finish;
  const requests = [];
  driver.getAssets = async (options) => {
    requests.push(options);
    if (!options.after) return { assets: [real], hasNextPage: true, endCursor: "100" };
    return new Promise((resolve) => { finish = resolve; });
  };
  const pending = gallery.load();
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(gallery.getSnapshot().status, "ready");
  assert.equal(gallery.getSnapshot().refreshing, true);
  assert.deepEqual(plain(gallery.getSnapshot().media), [real]);
  assert.ok(requests.every((options) => options.metadataOnly === true));
  finish({ assets: [{ id: "second" }], hasNextPage: false });
  await pending;
  assert.equal(gallery.getSnapshot().media.length, 2);
  assert.equal(gallery.getSnapshot().refreshing, false);
});

test("full-to-limited changes clear formerly authorized originals before querying", async () => {
  const { gallery, driver } = setup();
  await gallery.load();
  driver.getPermissions = async () => ({ granted: true, canAskAgain: true, accessPrivileges: "limited" });
  let finish;
  driver.getAssets = () => new Promise((resolve) => { finish = resolve; });
  const pending = gallery.load();
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(gallery.getSnapshot().limited, true);
  assert.deepEqual(plain(gallery.getSnapshot().media), []);
  finish({ assets: [{ id: "selected" }], hasNextPage: false });
  await pending;
  assert.deepEqual(plain(gallery.getSnapshot().media.map((a) => a.id)), ["selected"]);
});

test("category-only Android access queries only authorized media and clears broader cached access", async () => {
  const { gallery, driver } = setup();
  await gallery.load();
  driver.getPermissions = async () => ({ granted: false, canAskAgain: true, accessPrivileges: "none", allowedMediaTypes: ["video"] });
  let finish;
  let query;
  driver.getAssets = (options) => { query = options; return new Promise((resolve) => { finish = resolve; }); };
  const pending = gallery.load();
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(gallery.getSnapshot().granted, true);
  assert.deepEqual(plain(gallery.getSnapshot().media), []);
  assert.deepEqual(plain(query.mediaType), ["video"]);
  finish({ assets: [{ id: "video", mediaType: "video" }], hasNextPage: false });
  await pending;
  assert.match(gallery.getSnapshot().message, /Showing videos only/);
  assert.equal(gallery.getSnapshot().mode, "device");
});
