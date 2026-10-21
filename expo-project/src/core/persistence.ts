import { emptyLibrary, initialState } from "./gallery";
import type { LibraryState, SavedState, Session } from "./model";
export const STATE_KEY = "@luma_native_state_v3";
export const CATALOG_KEY = "@luma_native_catalog_v3";
export const DEMO_KEY = "@luma_native_demo_catalog_v3";
export interface StorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
}
const strings = (v: unknown): string[] =>
  Array.isArray(v)
    ? [...new Set(v.filter((x): x is string => typeof x === "string"))]
    : [];
const number = (v: unknown, fallback = 0) =>
  typeof v === "number" && Number.isFinite(v) && v >= 0 ? v : fallback;
const legacyDemoIds: Record<string, string> = {
  "m-1": "demo-1",
  "m-2": "demo-2",
  "m-3": "demo-3",
  "m-4": "demo-4",
  "m-5": "demo-18",
  "m-6": "demo-6",
  "m-7": "demo-8",
  "m-8": "demo-9",
};
const migrateDemoBookmarks = (ids: string[]) => [
  ...new Set(ids.map((id) => legacyDemoIds[id] || id)),
];
function sessionFrom(v: unknown): Session | null {
  if (!v || typeof v !== "object") return null;
  const s = v as Partial<Session>;
  if (!Array.isArray(s.mediaIds) || typeof s.id !== "string") return null;
  const mediaIds = strings(s.mediaIds),
    valid = new Set(mediaIds);
  const decisions = Object.fromEntries(
    Object.entries(s.decisions ?? {}).filter(
      ([id, d]) => valid.has(id) && (d === "keep" || d === "delete"),
    ),
  );
  return {
    id: s.id,
    title: s.title || "Continue cleaning",
    subtitle: s.subtitle || "",
    collectionKey: s.collectionKey || "restored",
    collectionType: s.collectionType || "recents",
    mediaIds,
    decisions,
    history: strings(s.history).filter((id) => valid.has(id) && decisions[id]),
    currentIndex: Math.min(mediaIds.length, number(s.currentIndex)),
    createdAt: number(s.createdAt, Date.now()),
    lastActiveTime: number(s.lastActiveTime, Date.now()),
    confirmedDeleted: Array.isArray(s.confirmedDeleted)
      ? s.confirmedDeleted.filter((i) => typeof i.id === "string")
      : [],
  };
}
function libraryFrom(raw: Partial<LibraryState> | null): LibraryState {
  const base = emptyLibrary();
  if (!raw) return base;
  const stats = raw.stats ?? base.stats;
  return {
    ...base,
    bookmarks: strings(raw.bookmarks),
    session: sessionFrom(raw.session),
    completedSessions: strings(raw.completedSessions),
    progress: Object.fromEntries(
      Object.entries(raw.progress ?? {}).filter(
        ([, d]) => d === "keep" || d === "delete",
      ),
    ),
    stats: {
      ...base.stats,
      ...stats,
      totalSessions: number(
        stats.totalSessions,
        stats.cleanupLogs?.length ?? 0,
      ),
      totalReviewed: number(stats.totalReviewed),
      totalKept: number(stats.totalKept),
      totalDeleted: number(stats.totalDeleted),
      bytesReclaimed: number(stats.bytesReclaimed),
      unknownSizeCount: number(stats.unknownSizeCount),
      dailyStreak: number(stats.dailyStreak),
      lastCleanDate:
        typeof stats.lastCleanDate === "string" ? stats.lastCleanDate : "",
      cleanupLogs: Array.isArray(stats.cleanupLogs)
        ? stats.cleanupLogs.slice(0, 100)
        : [],
    },
  };
}
export class StateRepository {
  private tail: Promise<void> = Promise.resolve();
  constructor(private storage: StorageAdapter) {}
  async load(): Promise<SavedState> {
    const raw = await this.storage.getItem(STATE_KEY);
    if (raw) {
      const value = JSON.parse(raw) as SavedState;
      if (value.schema !== 3)
        throw new Error("This saved progress needs a newer version of Luma.");
      const base = initialState();
      return {
        ...base,
        ...value,
        schema: 3,
        mode: value.mode === "demo" ? "demo" : "device",
        settings: { ...base.settings, ...value.settings },
        device: libraryFrom(value.device),
        demo: {
          ...libraryFrom(value.demo),
          bookmarks: migrateDemoBookmarks(strings(value.demo?.bookmarks)),
        },
      };
    }
    const base = initialState();
    const read = async (key: string) => {
      const text = await this.storage.getItem(key);
      if (!text) return null;
      try {
        return JSON.parse(text);
      } catch {
        return null;
      }
    };
    // Preserve all original keys; importing never deletes or overwrites the old records.
    const bookmarks =
      (await read("@luma_native_bookmarks_v2")) ??
      (await read("@luma_native_bookmarks"));
    const session = await read("@luma_native_sessions_v2");
    const oldStats = await read("@luma_user_stats_v2");
    const stats =
      (await read("@luma_native_stats_v2")) ??
      (oldStats
        ? {
            dailyStreak: oldStats.streak,
            bytesReclaimed: oldStats.reclaimed,
            totalDeleted: oldStats.totalCleaned,
            totalReviewed: oldStats.totalCleaned,
          }
        : null);
    const settings = await read("@luma_native_settings_v2");
    base.device = libraryFrom({
      bookmarks: strings(bookmarks),
      session,
      stats,
    });
    const demoStats = await read("@luma_demo_user_stats_v2");
    base.demo = libraryFrom({
      bookmarks: migrateDemoBookmarks(
        strings(await read("@luma_demo_bookmarks_v2")),
      ),
      stats: demoStats
        ? {
            ...base.demo.stats,
            dailyStreak: demoStats.streak,
            bytesReclaimed: demoStats.reclaimed,
            totalDeleted: demoStats.totalCleaned,
            totalReviewed: demoStats.totalCleaned,
          }
        : base.demo.stats,
    });
    base.onboardingDone =
      (await this.storage.getItem("@luma_onboarding_completed_v2")) ===
        "true" ||
      (await this.storage.getItem("@luma_onboarding_done_v2")) === "true";
    if (settings && typeof settings === "object") {
      for (const key of [
        "hapticsEnabled",
        "reducedMotion",
        "showReviewBeforeFinish",
      ] as const)
        if (typeof settings[key] === "boolean")
          base.settings[key] = settings[key];
    }
    await this.save(base);
    return base;
  }
  save(state: SavedState): Promise<void> {
    return this.write(STATE_KEY, state);
  }
  write(key: string, value: unknown): Promise<void> {
    const serialized = JSON.stringify(value);
    const task = this.tail
      .catch(() => {})
      .then(() => this.storage.setItem(key, serialized));
    this.tail = task;
    return task;
  }
  async read<T>(key: string, fallback: T): Promise<T> {
    const text = await this.storage.getItem(key);
    if (!text) return fallback;
    try {
      return JSON.parse(text) as T;
    } catch {
      return fallback;
    }
  }
  flush(): Promise<void> {
    return this.tail;
  }
}
