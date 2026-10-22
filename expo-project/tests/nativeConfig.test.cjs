const assert = require("node:assert/strict");
const path = require("node:path");
const { test } = require("node:test");
const { getPrebuildConfigAsync } = require("@expo/prebuild-config");
const { compileModsAsync } = require("expo/config-plugins");

test("CNG generates photo permissions and preserves OS-managed deletion approval", async () => {
  const projectRoot = path.resolve(__dirname, "..");
  const platforms = ["android", "ios"];
  const { exp } = await getPrebuildConfigAsync(projectRoot, { platforms });
  const config = await compileModsAsync(exp, {
    projectRoot, platforms, introspect: true, ignoreExistingNativeFiles: true,
  });
  const generated = config._internal.modResults;
  const permissions = new Map(generated.android.manifest.manifest["uses-permission"].map((entry) => [entry.$["android:name"], entry.$]));
  for (const name of ["READ_MEDIA_IMAGES", "READ_MEDIA_VIDEO", "READ_MEDIA_VISUAL_USER_SELECTED"]) {
    assert.ok(permissions.has(`android.permission.${name}`));
    assert.notEqual(permissions.get(`android.permission.${name}`)?.["tools:node"], "remove");
  }
  for (const name of ["MANAGE_EXTERNAL_STORAGE", "MANAGE_MEDIA", "READ_MEDIA_AUDIO", "ACCESS_MEDIA_LOCATION"])
    assert.equal(permissions.get(`android.permission.${name}`)?.["tools:node"], "remove");
  assert.equal(permissions.get("android.permission.READ_EXTERNAL_STORAGE")["android:maxSdkVersion"], "32");
  const plist = generated.ios.infoPlist;
  assert.ok(plist.NSPhotoLibraryUsageDescription.includes("Luma"));
  assert.ok(plist.NSPhotoLibraryAddUsageDescription.includes("Luma"));
  assert.equal(plist.PHPhotoLibraryPreventAutomaticLimitedAccessAlert, true);
});
