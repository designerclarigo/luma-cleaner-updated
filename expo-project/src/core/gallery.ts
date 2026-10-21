import type {
  Collection,
  Decision,
  LibraryState,
  MediaItem,
  SavedState,
  Session,
  Stats,
} from "./model";

export const emptyStats = (): Stats => ({
  totalSessions: 0,
  totalReviewed: 0,
  totalKept: 0,
  totalDeleted: 0,
  bytesReclaimed: 0,
  unknownSizeCount: 0,
  dailyStreak: 0,
  lastCleanDate: "",
  cleanupLogs: [],
});
export const emptyLibrary = (): LibraryState => ({
  bookmarks: [],
  progress: {},
  session: null,
  stats: emptyStats(),
  completedSessions: [],
});
export const initialState = (): SavedState => ({
  schema: 3,
  onboardingDone: false,
  name: "Gallery Curator",
  joinedAt: Date.now(),
  mode: "device",
  settings: {
    hapticsEnabled: true,
    reducedMotion: false,
    showReviewBeforeFinish: true,
  },
  device: emptyLibrary(),
  demo: emptyLibrary(),
});
export function localDay(time = Date.now()): string {
  const d = new Date(time);
  return (
    d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getDate()).padStart(2, "0")
  );
}
function dayNumber(day: string): number {
  const [y, m, d] = day.split("-").map(Number);
  return Date.UTC(y, m - 1, d) / 86400000;
}
export function currentStreak(stats: Stats, now = Date.now()): number {
  const gap = dayNumber(localDay(now)) - dayNumber(stats.lastCleanDate);
  return gap === 0 || gap === 1 ? stats.dailyStreak : 0;
}
export function createSession(
  items: MediaItem[],
  type: string,
  key: string,
  title: string,
  subtitle = "",
  now = Date.now(),
): Session {
  return {
    id: "session-" + now + "-" + Math.random().toString(36).slice(2, 8),
    collectionType: type,
    collectionKey: key,
    title,
    subtitle,
    mediaIds: [...new Set(items.map((i) => i.id))],
    currentIndex: 0,
    decisions: {},
    history: [],
    createdAt: now,
    lastActiveTime: now,
    confirmedDeleted: [],
  };
}
export function decide(
  session: Session,
  id: string,
  decision: Decision,
  now = Date.now(),
): Session {
  // The expected ID makes rapid taps and stale gesture callbacks idempotent.
  if (session.mediaIds[session.currentIndex] !== id || session.decisions[id])
    return session;
  return {
    ...session,
    decisions: { ...session.decisions, [id]: decision },
    history: [...session.history, id],
    currentIndex: session.currentIndex + 1,
    lastActiveTime: now,
  };
}
export function undo(session: Session): Session {
  const id = session.history[session.history.length - 1];
  if (!id) return session;
  const decisions = { ...session.decisions };
  delete decisions[id];
  return {
    ...session,
    decisions,
    history: session.history.slice(0, -1),
    currentIndex: Math.max(0, session.mediaIds.indexOf(id)),
    lastActiveTime: Date.now(),
  };
}
export const pendingIds = (session: Session | null): string[] =>
  session
    ? session.mediaIds.filter((id) => session.decisions[id] === "delete")
    : [];
export function reviewSelection(session: Session, selected: string[]): Session {
  const picked = new Set(selected);
  const decisions = { ...session.decisions };
  for (const id of pendingIds(session))
    if (!picked.has(id)) decisions[id] = "keep";
  return { ...session, decisions };
}
export function confirmDeleted(
  library: LibraryState,
  catalog: MediaItem[],
  deletedIds: string[],
): LibraryState {
  const session = library.session;
  if (!session) return library;
  const requested = new Set(pendingIds(session));
  const previous = new Set(session.confirmedDeleted.map((i) => i.id));
  const confirmed = [...new Set(deletedIds)].filter(
    (id) => requested.has(id) && !previous.has(id),
  );
  if (!confirmed.length) return library;
  const removed = new Set(confirmed);
  const metadata = new Map(catalog.map((i) => [i.id, i]));
  const receipt = confirmed.map((id) => ({
    id,
    bytes: metadata.get(id)?.fileSize ?? 0,
    sizeKnown: metadata.get(id)?.fileSize !== undefined,
  }));
  const decisions = { ...session.decisions };
  for (const id of confirmed) delete decisions[id];
  const mediaIds = session.mediaIds.filter((id) => !removed.has(id));
  const next = mediaIds.findIndex((id) => !decisions[id]);
  return {
    ...library,
    bookmarks: library.bookmarks.filter((id) => !removed.has(id)),
    progress: {
      ...library.progress,
      ...Object.fromEntries(confirmed.map((id) => [id, "delete" as const])),
    },
    stats: {
      ...library.stats,
      totalDeleted: library.stats.totalDeleted + confirmed.length,
      totalReviewed: library.stats.totalReviewed + confirmed.length,
      bytesReclaimed:
        library.stats.bytesReclaimed + receipt.reduce((n, i) => n + i.bytes, 0),
      unknownSizeCount:
        library.stats.unknownSizeCount +
        receipt.filter((i) => !i.sizeKnown).length,
    },
    session: {
      ...session,
      mediaIds,
      decisions,
      history: session.history.filter((id) => !removed.has(id)),
      currentIndex: next < 0 ? mediaIds.length : next,
      confirmedDeleted: [...session.confirmedDeleted, ...receipt],
    },
  };
}
export function completeSession(
  library: LibraryState,
  now = Date.now(),
): LibraryState {
  const session = library.session;
  if (!session || library.completedSessions.includes(session.id))
    return library;
  if (pendingIds(session).length)
    throw new Error("Review pending deletions before completing this session.");
  const kept = Object.values(session.decisions).filter(
    (d) => d === "keep",
  ).length;
  const deleted = session.confirmedDeleted.length;
  const today = localDay(now);
  const gap = library.stats.lastCleanDate
    ? dayNumber(today) - dayNumber(library.stats.lastCleanDate)
    : Infinity;
  const active = kept + deleted > 0;
  const streak = !active
    ? currentStreak(library.stats, now)
    : gap === 0
      ? library.stats.dailyStreak
      : gap === 1
        ? library.stats.dailyStreak + 1
        : 1;
  return {
    ...library,
    session: null,
    progress: { ...library.progress, ...session.decisions },
    completedSessions: [...library.completedSessions, session.id].slice(-500),
    stats: {
      ...library.stats,
      totalKept: library.stats.totalKept + kept,
      totalSessions: library.stats.totalSessions + (active ? 1 : 0),
      totalReviewed: library.stats.totalReviewed + kept,
      dailyStreak: streak,
      lastCleanDate: active ? today : library.stats.lastCleanDate,
      cleanupLogs: active
        ? [
            {
              id: session.id,
              date: today,
              sessionTitle: session.title,
              keptCount: kept,
              deletedCount: deleted,
              bytesReclaimed: session.confirmedDeleted.reduce(
                (n, i) => n + i.bytes,
                0,
              ),
              unknownSizeCount: session.confirmedDeleted.filter(
                (i) => !i.sizeKnown,
              ).length,
            },
            ...library.stats.cleanupLogs,
          ].slice(0, 100)
        : library.stats.cleanupLogs,
    },
  };
}
export function reconcileLibrary(
  library: LibraryState,
  catalog: MediaItem[],
  fullAccess: boolean,
): LibraryState {
  // Limited access can hide media without deleting it. Never destroy saved hidden state.
  if (!fullAccess) return library;
  const ids = new Set(catalog.map((i) => i.id));
  const session = library.session;
  const bookmarks = library.bookmarks.filter((id) => ids.has(id));
  if (!session) return { ...library, bookmarks };
  const mediaIds = session.mediaIds.filter((id) => ids.has(id));
  const decisions = Object.fromEntries(
    Object.entries(session.decisions).filter(([id]) => ids.has(id)),
  );
  const next = mediaIds.findIndex((id) => !decisions[id]);
  return {
    ...library,
    bookmarks,
    session:
      mediaIds.length || session.confirmedDeleted.length
        ? {
            ...session,
            mediaIds,
            decisions,
            history: session.history.filter((id) => ids.has(id)),
            currentIndex: next < 0 ? mediaIds.length : next,
          }
        : null,
  };
}
export function collections(
  catalog: MediaItem[],
  library: LibraryState,
  albums = false,
): Collection[] {
  const grouped = new Map<string, MediaItem[]>();
  for (const item of catalog) {
    const key = albums
      ? item.albumName || "Camera"
      : Number.isFinite(item.creationTime) && item.creationTime > 0
        ? localDay(item.creationTime).slice(0, 7)
        : "unknown-date";
    const group = grouped.get(key) ?? [];
    group.push(item);
    grouped.set(key, group);
  }
  return [...grouped.entries()]
    .map(([key, items]) => {
      const reviewedCount = items.filter(
        (i) => library.progress[i.id] || library.session?.decisions[i.id],
      ).length;
      const date = new Date(items[0].creationTime);
      return {
        key,
        items,
        title: albums
          ? key
          : key === "unknown-date"
            ? "Date unavailable"
            : date.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              }),
        reviewedCount,
        isCompleted: items.length > 0 && reviewedCount === items.length,
        totalBytes: items.reduce((n, i) => n + (i.fileSize ?? 0), 0),
        unknownSizes: items.filter((i) => i.fileSize === undefined).length,
      };
    })
    .sort((a, b) =>
      albums
        ? a.title.localeCompare(b.title)
        : a.key === "unknown-date"
          ? 1
          : b.key === "unknown-date"
            ? -1
            : b.key.localeCompare(a.key),
    );
}
export function randomSelection(
  items: MediaItem[],
  count = 15,
  rng = Math.random,
): MediaItem[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, count);
}
export function onThisDay(items: MediaItem[], now = Date.now()): MediaItem[] {
  const today = new Date(now);
  return items.filter((i) => {
    const d = new Date(i.creationTime);
    return (
      Number.isFinite(i.creationTime) &&
      i.creationTime > 0 &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate() &&
      d.getFullYear() < today.getFullYear()
    );
  });
}
export function burstCandidates(items: MediaItem[]): MediaItem[] {
  // Metadata candidates only: close timestamps and identical dimensions, never a duplicate verdict.
  const photos = items
    .filter((i) => i.mediaType === "photo")
    .sort((a, b) => a.creationTime - b.creationTime);
  const ids = new Set<string>();
  for (let i = 1; i < photos.length; i++) {
    const a = photos[i - 1],
      b = photos[i];
    if (
      b.creationTime - a.creationTime <= 3000 &&
      a.width === b.width &&
      a.height === b.height &&
      a.albumName === b.albumName
    ) {
      ids.add(a.id);
      ids.add(b.id);
    }
  }
  return items.filter((i) => ids.has(i.id));
}
export const screenshots = (items: MediaItem[]) =>
  items.filter((i) =>
    /screenshot|screen_shot/i.test(i.filename + " " + i.albumName),
  );
export function formatBytes(bytes?: number): string {
  if (bytes === undefined) return "Size unavailable";
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const n = Math.min(4, Math.floor(Math.log(bytes) / Math.log(1024)));
  return (
    parseFloat((bytes / Math.pow(1024, n)).toFixed(1)) +
    " " +
    ["B", "KB", "MB", "GB", "TB"][n]
  );
}
export function formatDate(time: number): string {
  return time
    ? new Date(time).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Date unavailable";
}
export const bytesLabel = (items: MediaItem[]) => {
  const known = items.filter((i) => i.fileSize !== undefined);
  return known.length
    ? formatBytes(known.reduce((n, i) => n + (i.fileSize ?? 0), 0)) +
        (known.length < items.length ? "+ measured" : "")
    : "Size unavailable";
};
