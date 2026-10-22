import type { NativeMediaAsset, NativeMediaPage } from "./nativeMediaService";

export type GalleryMode = "device";
export type GalleryStatus =
  | "loading"
  | "ready"
  | "empty"
  | "permission"
  | "error"
  | "unsupported";
export interface GallerySnapshot {
  mode: GalleryMode;
  status: GalleryStatus;
  media: NativeMediaAsset[];
  message: string;
  granted: boolean;
  limited: boolean;
  canAskAgain: boolean;
  refreshing: boolean;
  mediaTypes: ("photo" | "video")[];
}
interface PermissionResult {
  granted: boolean;
  accessPrivileges?: string;
  canAskAgain: boolean;
  allowedMediaTypes?: ("photo" | "video")[];
}
interface GalleryDriver {
  getPermissions(): Promise<PermissionResult>;
  requestPermissions(): Promise<PermissionResult>;
  getAssets(options: {
    first: number;
    after?: string;
    metadataOnly?: boolean;
    mediaType?: ("photo" | "video")[];
  }): Promise<NativeMediaPage>;
}

/** The gallery contains authorized device originals only, never sample media. */
export class GalleryLibrary {
  private generation = 0;
  private listeners = new Set<() => void>();
  private snapshot: GallerySnapshot = {
    mode: "device",
    status: "loading",
    media: [],
    message: "Checking photo library access…",
    granted: false,
    limited: false,
    canAskAgain: true,
    refreshing: false,
    mediaTypes: ["photo", "video"],
  };
  constructor(
    private driver: GalleryDriver,
    private platform: string,
  ) {}
  getSnapshot = () => this.snapshot;
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };
  private publish(snapshot: GallerySnapshot) {
    this.snapshot = snapshot;
    this.listeners.forEach((listener) => listener());
  }
  removeDeleted(ids: string[]) {
    if (!ids.length) return;
    // A reload started before native confirmation must not reintroduce removed media.
    this.generation++;
    const removed = new Set(ids);
    const media = this.snapshot.media.filter((asset) => !removed.has(asset.id));
    this.publish({
      ...this.snapshot,
      media,
      refreshing: false,
      status: media.length ? "ready" : "empty",
    });
  }
  reportWatchError() {
    if (this.snapshot.mode === "device" && this.snapshot.granted) {
      this.publish({
        ...this.snapshot,
        message:
          "Automatic gallery updates could not connect. Use Refresh to check for changes.",
      });
    }
  }
  async load(requestPermission = false): Promise<void> {
    const generation = ++this.generation;
    const previous = this.snapshot;
    const retain =
      previous.mode === "device" &&
      previous.granted &&
      (previous.status === "ready" || previous.status === "empty");
    let next: GallerySnapshot = retain
      ? { ...previous, refreshing: true }
      : {
          mode: "device",
          status: "loading",
          media: [],
          message: "Connecting to your photo library…",
          granted: false,
          limited: false,
          canAskAgain: true,
          refreshing: true,
          mediaTypes: ["photo", "video"],
        };
    this.publish(next);
    if (this.platform !== "android" && this.platform !== "ios") {
      this.publish({
        ...next,
        refreshing: false,
        status: "unsupported",
        message:
          "Use the native app. Your real photo library and system deletion confirmation require Luma for Android or iOS.",
      });
      return;
    }
    try {
      const permission = await (requestPermission
        ? this.driver.requestPermissions()
        : this.driver.getPermissions());
      if (generation !== this.generation) return;
      next = {
        ...next,
        granted:
          permission.granted || permission.accessPrivileges === "limited" || !!permission.allowedMediaTypes?.length,
        limited: permission.accessPrivileges === "limited",
        canAskAgain: permission.canAskAgain,
        mediaTypes: permission.allowedMediaTypes ?? ["photo", "video"],
      };
      // Full-to-limited access must never retain previously authorized originals.
      const retainCatalog = retain && !next.limited && previous.mediaTypes.join() === next.mediaTypes.join();
      if (!retainCatalog) next = { ...next, media: [], status: "loading" };
      if (!next.granted) {
        this.publish({
          ...next,
          status: "permission",
          media: [],
          refreshing: false,
          message: permission.canAskAgain
            ? "Allow photo and video access to see your real gallery. No sample photos have been loaded."
            : "Photo access is disabled. Enable access in your device Settings, then retry.",
        });
        return;
      }
      this.publish({
        ...next,
        message: retainCatalog
          ? previous.message
          : next.limited
            ? "Loading the photos you selected…"
            : "Loading your gallery…",
      });
      const assets = new Map<string, NativeMediaAsset>();
      const cursors = new Set<string>();
      let after: string | undefined;
      let unavailable = 0;
      for (;;) {
        const page = await this.driver.getAssets({ first: 100, after, metadataOnly: true, mediaType: next.mediaTypes });
        if (generation !== this.generation) return;
        for (const asset of page.assets)
          assets.set(asset.id, { ...asset, source: "device" });
        unavailable += page.unavailableCount ?? 0;
        if (!retainCatalog && assets.size && page.hasNextPage) {
          this.publish({
            ...next,
            media: [...assets.values()],
            status: "ready",
            refreshing: true,
            message: `Loading more of your library… ${assets.size} items loaded.`,
          });
        }
        if (!page.hasNextPage) break;
        if (!page.endCursor || cursors.has(page.endCursor))
          throw new Error(
            "The gallery returned an invalid page cursor. Please retry.",
          );
        cursors.add(page.endCursor);
        after = page.endCursor;
      }
      const media = [...assets.values()];
      if (!media.length && unavailable)
        throw new Error(
          "The available photos could not be read. Check photo access and try again.",
        );
      this.publish({
        ...next,
        media,
        refreshing: false,
        status: media.length ? "ready" : "empty",
        message: unavailable
          ? `${unavailable} item(s) could not be loaded. Retry to check again.`
          : next.limited
            ? "Showing only the photos and videos you allowed."
            : next.mediaTypes.length === 1
              ? `Showing ${next.mediaTypes[0] === "photo" ? "photos" : "videos"} only. Manage photo access in Settings to include ${next.mediaTypes[0] === "photo" ? "videos" : "photos"}.`
            : media.length
              ? ""
              : "No photos or videos are available in your permitted library.",
      });
    } catch (error) {
      if (generation !== this.generation) return;
      this.publish({
        ...next,
        status: "error",
        media: [],
        refreshing: false,
        message:
          "Could not load your gallery. " +
          (error instanceof Error
            ? error.message
            : "Check photo access and try again."),
      });
    }
  }
}
