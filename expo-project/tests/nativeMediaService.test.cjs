const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");

// Exercise the real service with native boundaries mocked. No device or gallery is touched.
function setup(os = "android", version = 35) {
  const state = {
    queries: [],
    rows: [],
    permissionCalls: [],
    deleted: [],
    haptics: [],
    storage: new Map(),
    required: [],
    fileSizes: new Map(),
    albumIds: [],
    pickerCalls: [],
    nativeMediaAvailable: true,
    listeners: new Set(),
    metadataRows: [],
    uriCalls: [],
    assetTypes: new Map(),
  };
  class Asset {
    constructor(id) {
      this.id = id;
    }
    async getMediaType() {
      const type = state.assetTypes.get(this.id);
      if (type instanceof Error) throw type;
      return type ?? "image";
    }
    async getUri() {
      state.uriCalls.push(this.id);
      return "file://resolved-video.mov";
    }
    static async delete(assets) {
      state.deleted.push(assets.map((asset) => asset.id));
      if (state.deleteResult) await state.deleteResult();
    }
  }
  class Album {
    constructor(id) {
      this.id = id;
    }
    static async getAll() {
      return [new Album("camera")];
    }
    async getTitle() {
      return "Camera";
    }
    async getAssets() {
      return state.albumIds.map((id) => new Asset(id));
    }
  }
  class Query {
    constructor() {
      state.queries.push(this);
    }
    within(field, values) {
      this.filter = { field, values };
      return this;
    }
    orderBy(sort) {
      this.sort = sort;
      return this;
    }
    offset(value) {
      this.start = value;
      return this;
    }
    limit(value) {
      this.size = value;
      return this;
    }
    album(value) {
      this.selectedAlbum = value;
      return this;
    }
    async exe() {
      return state.rows;
    }
    async exeForMetadata() {
      return state.metadataRows;
    }
  }
  const permissions = {
    granted: true,
    status: "granted",
    accessPrivileges: "limited",
    canAskAgain: true,
    expires: "never",
  };
  const dependencies = {
    expo: {
      requireOptionalNativeModule(name) {
        assert.equal(name, "ExpoMediaLibraryNext");
        return state.nativeMediaAvailable ? {} : null;
      },
    },
    "expo-file-system": {
      File: class {
        constructor(uri) {
          this.uri = uri;
        }
        get size() {
          const size = state.fileSizes.get(this.uri);
          if (size instanceof Error) throw size;
          return size ?? null;
        }
      },
    },
    "expo-media-library": {
      Asset,
      Album,
      Query,
      AssetField: { MEDIA_TYPE: "mediaType", CREATION_TIME: "creationTime" },
      MediaType: { IMAGE: "image", VIDEO: "video" },
      async requestPermissionsAsync(...args) {
        state.permissionCalls.push(args);
        return permissions;
      },
      async getPermissionsAsync(...args) {
        state.permissionCalls.push(args);
        if (args[1]?.length === 1 && state.categoryPermissions)
          return { ...permissions, granted: !!state.categoryPermissions[args[1][0]] };
        return permissions;
      },
      async presentPermissionsPicker(...args) {
        state.pickerCalls.push(args);
      },
      addListener(listener) {
        state.listeners.add(listener);
        return {
          remove() {
            state.listeners.delete(listener);
          },
        };
      },
    },
    "@react-native-async-storage/async-storage": {
      async getItem(key) {
        return state.storage.get(key) ?? null;
      },
      async setItem(key, value) {
        state.storage.set(key, value);
      },
    },
    "expo-haptics": {
      NotificationFeedbackType: { Success: "success", Warning: "warning" },
      ImpactFeedbackStyle: { Light: "light", Medium: "medium" },
      async notificationAsync(type) {
        state.haptics.push(type);
        if (state.hapticError) throw new Error("No haptics engine");
      },
      async impactAsync(type) {
        state.haptics.push(type);
      },
    },
    "react-native": { Platform: { OS: os, Version: version } },
  };
  const file = path.join(__dirname, "../src/services/nativeMediaService.ts");
  const code = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
  }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(
    code,
    {
      module,
      exports: module.exports,
      require(name) {
        state.required.push(name);
        assert.ok(name in dependencies, `Unexpected dependency: ${name}`);
        return dependencies[name];
      },
      console: { warn() {} },
    },
    { filename: file },
  );
  return { service: module.exports.NativeMediaService, state, permissions };
}

const plain = (value) => JSON.parse(JSON.stringify(value));
const row = (id, overrides = {}) => ({
  async getInfo() {
    return {
      id,
      uri: `content://media/${id}`,
      filename: `${id}.jpg`,
      mediaType: "image",
      width: 400,
      height: 300,
      creationTime: 1700000000000,
      modificationTime: null,
      duration: null,
      ...overrides,
    };
  },
});

test("reports measured local sizes and keeps cloud/provider sizes unknown", async () => {
  const { service, state } = setup();
  state.rows = [row("local"), row("cloud")];
  state.fileSizes.set("content://media/local", 4096);
  state.fileSizes.set("content://media/cloud", new Error("Cloud only"));
  const result = await service.getAssets();
  assert.equal(result.assets[0].fileSize, 4096);
  assert.equal(result.assets[1].fileSize, undefined);
  assert.equal(result.assets.length, 2);
});

test("album collections retain real native album IDs, titles and membership", async () => {
  const { service, state } = setup();
  state.albumIds = ["photo-a", "video-b"];
  assert.deepEqual(plain(await service.getAlbumCollections()), [
    { id: "camera", title: "Camera", ids: ["photo-a", "video-b"] },
  ]);
});

test("limited-access management selects photos/videos and disabled haptics emit no feedback", async () => {
  const { service, state } = setup();
  await service.manageLimitedAccess();
  assert.deepEqual(plain(state.pickerCalls), [[["photo", "video"]]]);
  service.hapticsEnabled = false;
  await service.triggerHaptic("success");
  assert.deepEqual(state.haptics, []);
});

test("requests only photos/videos and preserves the user choice of limited access", async () => {
  const { service, state, permissions } = setup();
  assert.equal(await service.requestPermissions(), permissions);
  assert.deepEqual(plain(state.permissionCalls), [[false, ["photo", "video"]]]);
});

test("native gallery change subscriptions can be removed without removing other listeners", async () => {
  const { service, state } = setup();
  let changed = 0;
  const remove = await service.subscribeToChanges(() => changed++);
  const removeOther = await service.subscribeToChanges(() => (changed += 10));
  for (const listener of state.listeners)
    listener({ hasIncrementalChanges: false });
  assert.equal(changed, 11);
  remove();
  for (const listener of state.listeners) listener({});
  assert.equal(changed, 21);
  removeOther();
  assert.equal(state.listeners.size, 0);
});

test("SDK 57 dates stay in milliseconds and video milliseconds become Luma seconds", async () => {
  const { service, state } = setup();
  state.rows = [
    row("video", {
      mediaType: "video",
      creationTime: 1750000000123,
      modificationTime: 1750000300000,
      duration: 90500,
    }),
  ];
  const [asset] = (await service.getAssets()).assets;
  assert.equal(asset.creationTime, 1750000000123);
  assert.equal(asset.modificationTime, 1750000300000);
  assert.equal(asset.duration, 90.5);
});

test("picker IDs resolve to original SDK 57 content URIs, never cached copies or demo media", () => {
  const { service } = setup();
  const catalog = [
    {
      id: "content://media/external/images/media/123",
      mediaType: "photo",
      source: "device",
    },
    {
      id: "content://media/external/video/media/456",
      mediaType: "video",
      source: "device",
    },
    { id: "123", mediaType: "photo", source: "demo" },
    {
      id: "content://other.provider/photo/123",
      mediaType: "photo",
      source: "device",
    },
  ];
  const picked = [
    { assetId: "123", type: "image", uri: "file://cache/copy.jpg" },
    { assetId: "456", type: "video" },
    { assetId: null },
  ];
  assert.deepEqual(
    plain(service.selectOriginals(catalog, picked).map((i) => i.id)),
    catalog.slice(0, 2).map((i) => i.id),
  );
  assert.equal(
    service.selectOriginals(catalog, [{ assetId: "123", type: "video" }])
      .length,
    0,
  );
  const { service: ios } = setup("ios");
  assert.deepEqual(
    plain(
      ios
        .selectOriginals(
          [{ id: "PH/identifier", source: "device", mediaType: "photo" }],
          [{ assetId: "PH/identifier", type: "image" }],
        )
        .map((i) => i.id),
    ),
    ["PH/identifier"],
  );
});

test("maps class API assets to Luma units, keeps mixed media, and detects the next page", async () => {
  const { service, state } = setup();
  state.rows = [
    row("photo"),
    row("video", { mediaType: "video", duration: 12500 }),
    row("lookahead"),
  ];
  const result = await service.getAssets({ first: 2 });
  assert.deepEqual(plain(result), {
    assets: [
      {
        id: "photo",
        uri: "content://media/photo",
        filename: "photo.jpg",
        mediaType: "photo",
        width: 400,
        height: 300,
        creationTime: 1700000000000,
        modificationTime: 0,
        source: "device",
      },
      {
        id: "video",
        uri: "content://media/video",
        filename: "video.jpg",
        mediaType: "video",
        width: 400,
        height: 300,
        creationTime: 1700000000000,
        modificationTime: 0,
        duration: 12.5,
        source: "device",
      },
    ],
    hasNextPage: true,
    endCursor: "2",
  });
  assert.deepEqual(plain(state.queries[0].filter), {
    field: "mediaType",
    values: ["image", "video"],
  });
  assert.deepEqual(plain(state.queries[0].sort), {
    key: "creationTime",
    ascending: false,
  });
  assert.equal(state.queries[0].size, 3);
});

test("advances an offset cursor, applies album and video filters, and handles an empty library", async () => {
  const { service, state } = setup();
  state.rows = [row("last")];
  const result = await service.getAssets({
    first: 2,
    after: "4",
    album: "camera",
    mediaType: ["video"],
  });
  assert.equal(result.endCursor, "5");
  assert.equal(result.hasNextPage, false);
  assert.equal(state.queries[0].start, 4);
  assert.equal(state.queries[0].selectedAlbum.id, "camera");
  assert.deepEqual(plain(state.queries[0].filter.values), ["video"]);
  state.rows = [];
  assert.deepEqual(plain(await service.getAssets()), {
    assets: [],
    hasNextPage: false,
  });
});

test("rejects invalid pagination before querying the native library", async () => {
  const { service, state } = setup();
  for (const options of [
    { first: 0 },
    { first: 1.5 },
    { after: "bad" },
    { after: "-1" },
    { after: "" },
  ]) {
    await assert.rejects(service.getAssets(options), /Invalid media page/);
  }
  assert.equal(state.queries.length, 0);
});

test("one inaccessible/cloud asset does not discard the page or corrupt the cursor", async () => {
  const { service, state } = setup();
  state.rows = [
    {
      async getInfo() {
        throw new Error("Asset unavailable");
      },
    },
    row("available"),
    row("next"),
  ];
  const result = await service.getAssets({ first: 2 });
  assert.deepEqual(plain(result.assets.map((asset) => asset.id)), [
    "available",
  ]);
  assert.equal(result.endCursor, "2");
  assert.equal(result.hasNextPage, true);
});

const deviceAsset = (id, fileSize) => ({ id, source: "device", fileSize });

test("lightweight discovery uses native IDs and never resolves iCloud originals", async () => {
  const { service, state } = setup("ios");
  state.metadataRows = [
    { id: "ph://photo/L0/001", filename: "IMG.HEIC", mediaType: "image", width: 3000, height: 4000,
      creationTime: 1750000000123, duration: null },
    { id: "ph://video/L0/001", filename: null, mediaType: "video", width: null, height: null,
      duration: 12000, creationTime: null },
    { id: "ph://lookahead" },
  ];
  const page = await service.getAssets({ first: 2, metadataOnly: true });
  assert.equal(page.hasNextPage, true);
  assert.equal(page.endCursor, "2");
  assert.equal(page.assets[0].uri, "ph://photo/L0/001");
  assert.equal(page.assets[0].creationTime, 1750000000123);
  assert.equal(page.assets[1].duration, 12);
  assert.equal(page.assets[1].filename, "Video");
  assert.equal(page.assets[1].width, 0);
  assert.equal(page.assets[1].fileSize, undefined);
  assert.deepEqual(state.uriCalls, []);
});

test("Android metadata pages measure available sizes without opening originals", async () => {
  const { service, state } = setup();
  const id = "content://media/external/images/media/18";
  state.metadataRows = [{ id, filename: "IMG.jpg", mediaType: "image", width: 400, height: 300 }];
  state.fileSizes.set(id, 2048);
  const page = await service.getAssets({ metadataOnly: true });
  assert.equal(page.assets[0].uri, id);
  assert.equal(page.assets[0].fileSize, 2048);
  assert.equal(page.hasNextPage, false);
});

test("only the active iOS device video resolves its playable original", async () => {
  const { service, state } = setup("ios");
  const uri = await service.getPlayableUri({ id: "ph://video/L0/001", uri: "ph://video/L0/001", source: "device" });
  assert.equal(uri, "file://resolved-video.mov");
  assert.deepEqual(state.uriCalls, ["ph://video/L0/001"]);
  assert.equal(await service.getPlayableUri({ id: "demo", uri: "https://example.com/video.mp4", source: "demo" }), "https://example.com/video.mp4");
  assert.equal(state.uriCalls.length, 1);
});

test("iOS picker local identifiers match ph:// original IDs and respect media type", () => {
  const { service } = setup("ios");
  const asset = { id: "ph://ABC/L0/001", uri: "ph://ABC/L0/001", source: "device", mediaType: "photo" };
  assert.deepEqual(plain(service.selectOriginals([asset], [{ assetId: "ABC/L0/001", type: "image" }])), [asset]);
  assert.equal(service.selectOriginals([asset], [{ assetId: "ABC/L0/001", type: "video" }]).length, 0);
  assert.equal(service.selectOriginals([{ ...asset, source: "demo" }], [{ assetId: "ABC/L0/001" }]).length, 0);
});

test("Android category permissions expose authorized photos when videos are denied", async () => {
  const { service, state, permissions } = setup();
  permissions.granted = false;
  permissions.accessPrivileges = "none";
  state.categoryPermissions = { photo: true, video: false };
  const result = await service.getPermissions();
  assert.deepEqual(plain(result.allowedMediaTypes), ["photo"]);
  assert.deepEqual(plain(state.permissionCalls), [[false, ["photo", "video"]], [false, ["photo"]], [false, ["video"]]]);
});

test("Android 10 and older cannot enter the SDK filesystem deletion path", async () => {
  for (const version of [28, 29]) {
    const { service, state } = setup("android", version);
    const result = await service.deleteAssets([deviceAsset("original", 1024)]);
    assert.equal(result.success, false);
    assert.deepEqual(plain(result.deletedIds), []);
    assert.equal(result.bytesReclaimed, 0);
    assert.match(result.error, /Android 11 or newer/);
    assert.deepEqual(state.deleted, []);
    assert.ok(!state.required.includes("expo-media-library"));
    await service.getPermissions(); // Viewing and organizing remain available in a native build.
    assert.equal(state.permissionCalls.length, 1);
  }
});

test("does not report deletion success before native confirmation completes", async () => {
  const { service, state } = setup();
  let approve;
  state.deleteResult = () =>
    new Promise((resolve) => {
      approve = resolve;
    });
  let completed = false;
  const pending = service
    .deleteAssets([
      deviceAsset("photo", 10),
      deviceAsset("photo", 10),
      deviceAsset("video", 20),
    ])
    .then((result) => {
      completed = true;
      return result;
    });
  // Wait for the asynchronous native module boundary to reach the confirmation prompt.
  for (let attempt = 0; attempt < 10 && !approve; attempt++)
    await new Promise((resolve) => setImmediate(resolve));
  assert.equal(typeof approve, "function");
  assert.equal(completed, false);
  assert.deepEqual(plain(state.deleted), [["photo", "video"]]);
  assert.deepEqual(state.haptics, []);
  approve();
  assert.deepEqual(plain(await pending), {
    success: true,
    deletedIds: ["photo", "video"],
    cancelled: false,
    bytesReclaimed: 30,
  });
  assert.deepEqual(state.haptics, ["success"]);
});

test("Android system refusal retains the selection and never emits success feedback", async () => {
  const { service, state } = setup();
  state.deleteResult = async () => {
    throw new Error("User didn't grant write permission to requested files.");
  };
  const result = await service.deleteAssets([deviceAsset("photo")]);
  assert.equal(result.success, false);
  assert.equal(result.cancelled, true);
  assert.match(result.error, /Deletion was cancelled/);
  assert.deepEqual(plain(result.deletedIds), []);
  assert.deepEqual(state.haptics, []);
  assert.deepEqual(plain(await service.deleteAssets([])), {
    success: true,
    deletedIds: [],
    cancelled: false,
    bytesReclaimed: 0,
  });
  assert.equal(state.deleted.length, 1);
});

test("iOS PhotoKit cancellation is distinct from permission and system failures", async () => {
  for (const [os, message, cancelled] of [
    ["ios", "The operation couldn’t be completed. (PHPhotosErrorDomain error 3072.)", true],
    ["ios", "The operation couldn’t be completed. (PHPhotosErrorDomain error 3311.)", false],
    ["android", "Missing media permission", false],
    ["android", "Activity is unavailable", false],
  ]) {
    const { service, state } = setup(os);
    state.deleteResult = async () => { throw new Error(message); };
    const result = await service.deleteAssets([deviceAsset("photo")]);
    assert.equal(result.cancelled, cancelled);
    assert.equal(result.success, false);
    assert.deepEqual(plain(result.deletedIds), []);
    assert.equal(result.bytesReclaimed, 0);
    assert.deepEqual(state.haptics, []);
  }
});

test("revoked access or a missing original prevents the system deletion request", async () => {
  for (const os of ["android", "ios"]) {
    const { service, state, permissions } = setup(os);
    permissions.granted = false;
    permissions.accessPrivileges = "none";
    let result = await service.deleteAssets([deviceAsset("photo")]);
    assert.equal(result.cancelled, false);
    assert.match(result.error, /Photo access has changed/);
    assert.deepEqual(state.deleted, []);
    if (os === "ios") {
      permissions.granted = true;
      state.assetTypes.set("photo", new Error("Original not found"));
      result = await service.deleteAssets([deviceAsset("photo")]);
      assert.equal(result.success, false);
      assert.equal(result.cancelled, false);
      assert.deepEqual(state.deleted, []);
    }
  }
});

test("photo-only access cannot delete a previously loaded video", async () => {
  const { service, state, permissions } = setup();
  permissions.granted = false;
  permissions.accessPrivileges = "none";
  state.categoryPermissions = { photo: true, video: false };
  const result = await service.deleteAssets([{ ...deviceAsset("video"), mediaType: "video" }]);
  assert.match(result.error, /no longer authorized/);
  assert.deepEqual(state.deleted, []);
});

test("large Android reviews stop on cancellation and report only earlier approved batches", async () => {
  const { service, state } = setup("android", 36);
  const assets = Array.from({ length: 2002 }, (_, n) => deviceAsset(String(n), 10));
  state.deleteResult = async () => {
    if (state.deleted.length === 2) throw new Error("User didn't grant write permission to requested files.");
  };
  const result = await service.deleteAssets(assets);
  assert.deepEqual(state.deleted.map((batch) => batch.length), [2000, 2]);
  assert.equal(result.success, false);
  assert.equal(result.cancelled, true);
  assert.deepEqual(plain(result.deletedIds), assets.slice(0, 2000).map((asset) => asset.id));
  assert.equal(result.bytesReclaimed, 20000);
  assert.match(result.error, /2000 items were deleted in earlier approved batches/);
});

test("only one system deletion request may be open at a time", async () => {
  const { service, state } = setup();
  let approve;
  state.deleteResult = () => new Promise((resolve) => { approve = resolve; });
  const first = service.deleteAssets([deviceAsset("first")]);
  for (let attempt = 0; attempt < 10 && !approve; attempt++)
    await new Promise((resolve) => setImmediate(resolve));
  const second = await service.deleteAssets([deviceAsset("second")]);
  assert.match(second.error, /already open/);
  assert.equal(state.deleted.length, 1);
  approve();
  assert.equal((await first).success, true);
});

test("haptic failure cannot turn a completed native deletion into a reported failure", async () => {
  const { service, state } = setup();
  state.hapticError = true;
  assert.equal(
    (await service.deleteAssets([deviceAsset("photo")])).success,
    true,
  );
  assert.equal(state.deleted.length, 1);
});

test("uses the SDK 57 album API on both platforms", async () => {
  for (const os of ["android", "ios"]) {
    const { service, state } = setup(os);
    const albums = await service.getAlbums();
    assert.deepEqual(plain(albums.map((album) => album.id)), ["camera"]);
  }
});

test("demo, unknown-source and mixed selections cannot invoke native deletion", async () => {
  const { service, state } = setup();
  for (const assets of [
    [{ id: "sample", source: "demo" }],
    [{ id: "unknown" }],
    [deviceAsset("photo"), { id: "sample", source: "demo" }],
  ]) {
    const result = await service.deleteAssets(assets);
    assert.equal(result.success, false);
    assert.deepEqual(plain(result.deletedIds), []);
  }
  assert.deepEqual(state.deleted, []);
});

test("legacy sample bookmarks never migrate into device bookmarks", async () => {
  const { service, state } = setup();
  state.storage.set("@luma_native_bookmarks", '["personal-photo"]');
  state.storage.set("@luma_demo_bookmarks_v2", '["sample-photo"]');
  assert.deepEqual(plain(await service.getBookmarks()), ["personal-photo"]);
  await service.saveBookmarks(["device-photo"]);
  assert.deepEqual(plain(await service.getBookmarks()), ["device-photo"]);
  assert.equal(state.storage.get("@luma_demo_bookmarks_v2"), '["sample-photo"]');
});

test("web never evaluates the native gallery module for permission or loading attempts", async () => {
  const { service, state } = setup("web");
  await assert.rejects(service.getPermissions(), /Android or iOS/);
  await assert.rejects(service.requestPermissions(), /Android or iOS/);
  await assert.rejects(service.getAssets(), /Android or iOS/);
  const deletion = await service.deleteAssets([deviceAsset("photo")]);
  assert.equal(deletion.success, false);
  assert.equal(deletion.cancelled, false);
  assert.match(deletion.error, /Use the native app/);
  assert.deepEqual(state.deleted, []);
  assert.deepEqual(state.permissionCalls, []);
  assert.deepEqual(state.queries, []);
  assert.ok(!state.required.includes("expo-media-library"));
});

test("a client missing the gallery module stays usable without importing it or touching media", async () => {
  for (const os of ["android", "ios"]) {
    const { service, state } = setup(os);
    state.nativeMediaAvailable = false;
    for (const call of [
      () => service.getPermissions(),
      () => service.requestPermissions(),
      () => service.getAssets(),
      () => service.getAlbums(),
      () => service.getAlbumCollections(),
      () => service.manageLimitedAccess(),
    ]) {
      await assert.rejects(call(), /Install Luma’s development build/);
    }
    const deletion = await service.deleteAssets([
      deviceAsset("original-photo"),
    ]);
    assert.equal(deletion.success, false);
    assert.deepEqual(plain(deletion.deletedIds), []);
    assert.match(deletion.error, /Install Luma’s development build/);
    assert.deepEqual(state.permissionCalls, []);
    assert.deepEqual(state.queries, []);
    assert.deepEqual(state.deleted, []);
    assert.ok(!state.required.includes("expo-media-library"));
  }
});

test("existing bookmarks migrate without losing legacy data and sessions still round-trip", async () => {
  const { service, state } = setup();
  state.storage.set("@luma_native_bookmarks", '["original-photo"]');
  assert.deepEqual(plain(await service.getBookmarks()), ["original-photo"]);
  assert.equal(
    state.storage.get("@luma_native_bookmarks"),
    '["original-photo"]',
  );
  await service.saveBookmarks(["original-photo", "new-photo"]);
  assert.deepEqual(plain(await service.getBookmarks()), [
    "original-photo",
    "new-photo",
  ]);
  await service.saveSession({ index: 3, markedForDelete: ["photo"] });
  assert.deepEqual(plain(await service.getSession()), {
    index: 3,
    markedForDelete: ["photo"],
  });
});
