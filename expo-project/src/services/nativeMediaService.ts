/**
 * Native Media Service for Expo SDK 57
 * Handles expo-media-library requests, native deletion prompts, genuine clutter detection, and AsyncStorage.
 */
import type * as MediaLibrary from "expo-media-library";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
import { File } from "expo-file-system";
import { requireOptionalNativeModule } from "expo";

export interface NativeMediaAsset {
  id: string;
  uri: string;
  filename: string;
  mediaType: "photo" | "video";
  width: number;
  height: number;
  creationTime: number;
  modificationTime: number;
  duration?: number;
  fileSize?: number;
  albumId?: string;
  albumName?: string;
  thumbnailUri?: string;
  source?: "device" | "demo";
  clusterTag?: string;
}

export interface DeletionResult {
  success: boolean;
  deletedIds: string[];
  cancelled: boolean;
  bytesReclaimed: number;
  error?: string;
}

export interface NativeMediaPage {
  assets: NativeMediaAsset[];
  hasNextPage: boolean;
  endCursor?: string;
  unavailableCount?: number;
}

const STORAGE_KEYS = {
  SESSIONS: "@luma_native_sessions_v2",
  BOOKMARKS: "@luma_native_bookmarks_v2",
  STATS: "@luma_native_stats_v2",
  SETTINGS: "@luma_native_settings_v2",
  LEGACY_BOOKMARKS: "@luma_native_bookmarks",
};

export class NativeMediaService {
  static hapticsEnabled = true;
  private static async mediaLibrary() {
    if (Platform.OS === "web")
      throw new Error("Device gallery access requires the Android or iOS app.");
    // Some Expo Go clients lack SDK 57's class API. Check before evaluating the
    // module, which otherwise logs a native-module error even when caught.
    if (!requireOptionalNativeModule("ExpoMediaLibraryNext")) {
      throw new Error(
        "This client does not include Luma’s gallery module. Install Luma’s development build to connect your gallery, or choose Demo mode to preview the app.",
      );
    }
    return import("expo-media-library");
  }
  /**
   * Request native permission to access device media (Read & Write)
   */
  static async requestPermissions(): Promise<MediaLibrary.PermissionResponse> {
    const MediaLibrary = await this.mediaLibrary();
    const response = await MediaLibrary.requestPermissionsAsync(false, [
      "photo",
      "video",
    ]);
    return response;
  }

  /**
   * Check current permission status without requesting
   */
  static async getPermissions(): Promise<MediaLibrary.PermissionResponse> {
    const MediaLibrary = await this.mediaLibrary();
    const response = await MediaLibrary.getPermissionsAsync(false, [
      "photo",
      "video",
    ]);
    return response;
  }

  static async subscribeToChanges(onChange: () => void): Promise<() => void> {
    const library = await this.mediaLibrary();
    const subscription = library.addListener(onChange);
    return () => subscription.remove();
  }

  static deletionUnavailableReason(): string {
    // SDK 57's pre-Android-11 deleter deletes files directly and swallows per-file
    // failures. Never enter that path or report its batch as natively confirmed.
    return Platform.OS === "android" && Number(Platform.Version) < 30
      ? "Native deletion confirmation requires Android 11 or newer with this SDK. Nothing will be deleted on this device. You can keep reviewing, undo marks, or keep everything."
      : "";
  }

  /**
   * Fetch assets with pagination from device photo library
   */
  static async getAssets(
    options: {
      first?: number;
      after?: string;
      album?: MediaLibrary.Album | string;
      mediaType?: ("photo" | "video")[];
    } = {},
  ): Promise<NativeMediaPage> {
    const first = options.first ?? 60;
    const offset = options.after === undefined ? 0 : Number(options.after);
    if (
      !Number.isSafeInteger(first) ||
      first < 1 ||
      !Number.isSafeInteger(offset) ||
      offset < 0 ||
      options.after === ""
    ) {
      throw new RangeError("Invalid media page size or cursor");
    }
    const MediaLibrary = await this.mediaLibrary();
    const query = new MediaLibrary.Query()
      .within(
        MediaLibrary.AssetField.MEDIA_TYPE,
        (options.mediaType ?? ["photo", "video"]).map((type) =>
          type === "video"
            ? MediaLibrary.MediaType.VIDEO
            : MediaLibrary.MediaType.IMAGE,
        ),
      )
      .orderBy({ key: MediaLibrary.AssetField.CREATION_TIME, ascending: false })
      .offset(offset)
      .limit(first + 1);
    if (options.album)
      query.album(
        typeof options.album === "string"
          ? new MediaLibrary.Album(options.album)
          : options.album,
      );
    const rows = await query.exe();
    const page = rows.slice(0, first);
    const assets: NativeMediaAsset[] = [];
    let unavailableCount = 0;
    for (let i = 0; i < page.length; i += 8) {
      const batch = await Promise.allSettled(
        page.slice(i, i + 8).map(async (asset) => {
          const info = await asset.getInfo();
          let fileSize: number | undefined;
          try {
            const size = new File(info.uri).size;
            if (typeof size === "number" && size > 0) fileSize = size;
          } catch {
            /* Cloud/provider asset size is unavailable. */
          }
          return {
            id: info.id,
            uri: info.uri,
            filename: info.filename,
            mediaType:
              info.mediaType === MediaLibrary.MediaType.VIDEO
                ? ("video" as const)
                : ("photo" as const),
            width: info.width,
            height: info.height,
            // SDK 57's class API returns dates and durations in milliseconds.
            creationTime: info.creationTime ?? 0,
            modificationTime: info.modificationTime ?? 0,
            duration: info.duration == null ? undefined : info.duration / 1000,
            fileSize,
            source: "device" as const,
          };
        }),
      );
      for (const result of batch) {
        if (result.status === "fulfilled") assets.push(result.value);
        else unavailableCount++;
      }
    }
    return {
      assets,
      hasNextPage: rows.length > first,
      ...(page.length ? { endCursor: String(offset + page.length) } : {}),
      ...(unavailableCount ? { unavailableCount } : {}),
    };
  }

  /**
   * Delete assets natively using the OS deletion dialog.
   * On Android and iOS, this triggers the OS-level system prompt.
   * Accurately distinguishes between confirmed deletion, user cancellation, and system failure.
   */
  static async deleteAssets(
    assetsToDelete: NativeMediaAsset[],
  ): Promise<DeletionResult> {
    if (!assetsToDelete || assetsToDelete.length === 0) {
      return {
        success: true,
        deletedIds: [],
        cancelled: false,
        bytesReclaimed: 0,
      };
    }

    // The native deletion boundary accepts only an explicitly device-only selection.
    // Demo simulation lives in the explicitly labelled demo UI, never in this method.
    if (assetsToDelete.some((asset) => asset.source !== "device")) {
      return {
        success: false,
        deletedIds: [],
        cancelled: false,
        bytesReclaimed: 0,
        error:
          "Only device gallery assets can be deleted through the native library.",
      };
    }
    const unique = [
      ...new Map(assetsToDelete.map((asset) => [asset.id, asset])).values(),
    ];
    const unsupported = this.deletionUnavailableReason();
    if (unsupported)
      return {
        success: false,
        deletedIds: [],
        cancelled: false,
        bytesReclaimed: 0,
        error: unsupported,
      };
    try {
      const MediaLibrary = await this.mediaLibrary();
      await MediaLibrary.Asset.delete(
        unique.map((asset) => new MediaLibrary.Asset(asset.id)),
      );
    } catch (error) {
      return {
        success: false,
        deletedIds: [],
        cancelled: true,
        bytesReclaimed: 0,
        error:
          error instanceof Error
            ? error.message
            : "Native deletion was cancelled or could not complete.",
      };
    }
    await this.triggerHaptic("success");
    return {
      success: true,
      deletedIds: unique.map((asset) => asset.id),
      cancelled: false,
      bytesReclaimed: unique.reduce(
        (sum, asset) => sum + (asset.fileSize ?? 0),
        0,
      ),
    };
  }

  /**
   * Genuine Duplicate & Burst Clustering
   * Analyzes assets by timestamp proximity (<= 15 seconds) and dimension similarity,
   * plus burst naming patterns (_BURST, (1), _01, _02, copy, duplicate).
   */
  static detectDuplicatesAndSimilars(assets: NativeMediaAsset[]): {
    items: NativeMediaAsset[];
    clustersCount: number;
  } {
    if (assets.length === 0) return { items: [], clustersCount: 0 };

    const sorted = [...assets].sort((a, b) => a.creationTime - b.creationTime);
    const detectedSet = new Set<string>();
    let clusters = 0;

    for (let i = 0; i < sorted.length; i++) {
      const current = sorted[i];
      const fn = current.filename.toLowerCase();

      // Check explicit burst/duplicate tags
      const hasBurstTag =
        fn.includes("burst") ||
        fn.includes("copy") ||
        fn.includes("duplicate") ||
        fn.includes("_01") ||
        fn.includes("_02") ||
        fn.includes("(1)");

      // Check temporal proximity with next photo (burst sequence within 12 seconds)
      let matchedBurst = false;
      if (i < sorted.length - 1) {
        const next = sorted[i + 1];
        const timeDiffMs = Math.abs(next.creationTime - current.creationTime);
        const ratioDiff = Math.abs(
          current.width / (current.height || 1) -
            next.width / (next.height || 1),
        );

        if (timeDiffMs < 12000 && ratioDiff < 0.05) {
          detectedSet.add(current.id);
          detectedSet.add(next.id);
          matchedBurst = true;
          clusters += 1;
        }
      }

      if (hasBurstTag && !matchedBurst) {
        detectedSet.add(current.id);
        clusters += 1;
      }
    }

    const items = assets.filter((a) => detectedSet.has(a.id));
    return {
      items,
      clustersCount: Math.max(clusters, items.length > 0 ? 1 : 0),
    };
  }

  /**
   * Genuine Screenshot Detection
   * Analyzes portrait/landscape aspect ratios matching mobile screens (~19.5:9, 16:9, etc.)
   * or file nomenclature and album tagging.
   */
  static detectScreenshots(assets: NativeMediaAsset[]): NativeMediaAsset[] {
    return assets.filter((item) => {
      const fn = item.filename.toLowerCase();
      if (
        fn.includes("screenshot") ||
        fn.includes("screen_shot") ||
        fn.includes("screen-shot")
      ) {
        return true;
      }
      // Check typical smartphone viewport aspect ratios (e.g. 19.5:9 = 2.16, 20:9 = 2.22, 16:9 = 1.77)
      if (item.width > 0 && item.height > 0) {
        const ratio =
          Math.max(item.width, item.height) / Math.min(item.width, item.height);
        if (ratio >= 2.05 && ratio <= 2.25) {
          // Additional indicator: non-camera resolution or PNG format
          if (fn.endsWith(".png") || item.fileSize! < 2500000) {
            return true;
          }
        }
      }
      return false;
    });
  }

  /**
   * Genuine Large Video Detection
   * Filters video media and sorts descending by size.
   */
  static detectLargeVideos(assets: NativeMediaAsset[]): NativeMediaAsset[] {
    return assets
      .filter((item) => item.mediaType === "video")
      .sort((a, b) => (b.fileSize || 0) - (a.fileSize || 0));
  }

  /**
   * Genuine Blur & Low-Quality Candidate Detection
   * Looks for lower byte density relative to dimensions, mist/blur tags, or burst outliers.
   */
  static detectBlurryPhotos(assets: NativeMediaAsset[]): NativeMediaAsset[] {
    return assets.filter((item) => {
      if (item.mediaType !== "photo") return false;
      const fn = item.filename.toLowerCase();
      if (fn.includes("blur") || fn.includes("motion") || fn.includes("mist")) {
        return true;
      }
      // Low byte-per-pixel ratio indicating lack of detail / compression fuzz
      if (item.width > 2000 && item.height > 2000 && item.fileSize) {
        const totalPixels = item.width * item.height;
        const bytesPerPixel = item.fileSize / totalPixels;
        if (bytesPerPixel < 0.22) {
          return true;
        }
      }
      return false;
    });
  }

  /**
   * Retrieve list of albums on the device
   */
  static async getAlbums(): Promise<MediaLibrary.Album[]> {
    const MediaLibrary = await this.mediaLibrary();
    return MediaLibrary.Album.getAll();
  }

  static async getAlbumCollections(): Promise<
    { id: string; title: string; ids: string[] }[]
  > {
    const library = await this.mediaLibrary();
    const albums = await library.Album.getAll();
    const result = [];
    // Fetch membership without resolving or downloading every asset again.
    for (const album of albums) {
      const [title, assets] = await Promise.all([
        album.getTitle(),
        album.getAssets(),
      ]);
      result.push({
        id: album.id,
        title,
        ids: assets.map((asset) => asset.id),
      });
    }
    return result;
  }

  static async manageLimitedAccess() {
    const library = await this.mediaLibrary();
    await library.presentPermissionsPicker(["photo", "video"]);
  }

  static selectOriginals(
    catalog: NativeMediaAsset[],
    picked: { assetId?: string | null; type?: string | null }[],
  ): NativeMediaAsset[] {
    return catalog.filter(
      (asset) =>
        asset.source === "device" &&
        picked.some((selection) => {
          if (!selection.assetId) return false;
          const kind =
            selection.type === "video"
              ? "video"
              : selection.type === "image" || selection.type === "livePhoto"
                ? "photo"
                : undefined;
          if (kind && kind !== asset.mediaType) return false;
          if (selection.assetId === asset.id) return true;
          // ImagePicker returns a numeric MediaStore ID on Android; SDK 57's Asset
          // uses the original content URI. Never substitute the picker's cached copy.
          const id =
            Platform.OS === "android" && /^\d+$/.test(selection.assetId)
              ? /^content:\/\/media\/[^/]+\/(?:images\/media|video\/media|file)\/(\d+)$/.exec(
                  asset.id,
                )?.[1]
              : undefined;
          return id !== undefined && id === selection.assetId;
        }),
    );
  }

  /**
   * Trigger soft tactile vibration on card swipe
   */
  static async triggerHaptic(
    type: "light" | "medium" | "success" | "warning" = "light",
  ) {
    if (!this.hapticsEnabled) return;
    try {
      if (type === "light") {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else if (type === "medium") {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } else if (type === "success") {
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success,
        );
      } else if (type === "warning") {
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Warning,
        );
      }
    } catch {
      // Haptics not available on emulator/web
    }
  }

  /**
   * Persist session state into AsyncStorage
   */
  static async saveSession(session: any): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.SESSIONS,
        JSON.stringify(session),
      );
    } catch (e) {
      console.warn("Failed to save session:", e);
    }
  }

  /**
   * Retrieve session state from AsyncStorage
   */
  static async getSession(): Promise<any | null> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.SESSIONS);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  /**
   * Persist bookmarks with migration support
   */
  static async saveBookmarks(
    ids: string[],
    mode: "device" | "demo" = "device",
  ): Promise<void> {
    try {
      await AsyncStorage.setItem(
        mode === "demo" ? "@luma_demo_bookmarks_v2" : STORAGE_KEYS.BOOKMARKS,
        JSON.stringify(ids),
      );
    } catch (e) {
      console.warn("Failed to save bookmarks:", e);
    }
  }

  /**
   * Retrieve bookmarks (migrating legacy storage if present)
   */
  static async getBookmarks(
    mode: "device" | "demo" = "device",
  ): Promise<string[]> {
    try {
      let raw = await AsyncStorage.getItem(
        mode === "demo" ? "@luma_demo_bookmarks_v2" : STORAGE_KEYS.BOOKMARKS,
      );
      if (!raw && mode === "device") {
        raw = await AsyncStorage.getItem(STORAGE_KEYS.LEGACY_BOOKMARKS);
        if (raw) {
          await AsyncStorage.setItem(STORAGE_KEYS.BOOKMARKS, raw);
        }
      }
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
}
