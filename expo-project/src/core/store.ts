import {
  completeSession,
  confirmDeleted,
  createSession,
  decide,
  emptyLibrary,
  initialState,
  pendingIds,
  reviewSelection,
  undo,
} from "./gallery";
import type {
  CleanupLog,
  Decision,
  MediaItem,
  SavedState,
  Settings,
} from "./model";
import { StateRepository } from "./persistence";

export interface StoreSnapshot {
  saved: SavedState;
  ready: boolean;
  error: string;
  busy: boolean;
  result: CleanupLog | null;
  interrupted: boolean;
}
type DeleteDriver = (
  items: MediaItem[],
) => Promise<{ deletedIds: string[]; error?: string }>;
/** One serialized persistence queue for every gallery decision, bookmark and setting. */
export class LumaStore {
  private snapshot: StoreSnapshot = {
    saved: initialState(),
    ready: false,
    error: "",
    busy: false,
    result: null,
    interrupted: false,
  };
  private listeners = new Set<() => void>();
  constructor(
    readonly repository: StateRepository,
    private deleteDriver: DeleteDriver,
  ) {}
  subscribe = (fn: () => void) => {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  };
  getSnapshot = () => this.snapshot;
  private publish(patch: Partial<StoreSnapshot>) {
    this.snapshot = { ...this.snapshot, ...patch };
    this.listeners.forEach((fn) => fn());
  }
  async load() {
    if (this.snapshot.ready) return;
    try {
      const saved = await this.repository.load();
      this.publish({
        saved,
        ready: true,
        error: "",
        interrupted: !!saved.deletionAttempt,
      });
    } catch (error) {
      this.publish({
        error: "Saved progress could not be opened. " + String(error),
      });
    }
  }
  private update(saved: SavedState): Promise<void> {
    this.publish({ saved });
    return this.repository.save(saved).then(
      () => this.publish({ error: "" }),
      (error) => {
        this.publish({
          error:
            "Progress could not be saved. Retry before leaving Luma. " +
            String(error),
        });
        throw error;
      },
    );
  }
  private change(fn: (s: SavedState) => SavedState) {
    if (!this.snapshot.ready || this.snapshot.busy) return;
    void this.update(fn(this.snapshot.saved)).catch(() => {});
  }
  retrySave = () => this.update(this.snapshot.saved).catch(() => {});
  async onboard(): Promise<void> {
    if (!this.snapshot.ready || this.snapshot.busy)
      throw new Error("Wait until saved progress is ready.");
    if (this.snapshot.saved.onboardingDone) return;
    const saved = { ...this.snapshot.saved, onboardingDone: true };
    // Keep the welcome screen visible and retryable until completion is durable.
    await this.repository.save(saved);
    this.publish({ saved, error: "" });
  }
  name(name: string) {
    this.change((s) => ({
      ...s,
      name: name.trim().slice(0, 40) || "Gallery Curator",
    }));
  }
  settings(settings: Partial<Settings>) {
    this.change((s) => ({ ...s, settings: { ...s.settings, ...settings } }));
  }
  bookmark(id: string) {
    this.change((s) => {
      const library = s[s.mode];
      return {
        ...s,
        [s.mode]: {
          ...library,
          bookmarks: library.bookmarks.includes(id)
            ? library.bookmarks.filter((i) => i !== id)
            : [...library.bookmarks, id],
        },
      };
    });
  }
  start(items: MediaItem[], title: string, type = "collection", key = title) {
    if (!items.length) return;
    if (items.some((item) => item.source !== "device"))
      throw new Error("Only device gallery originals can start a cleanup session.");
    this.change((s) => ({
      ...s,
      [s.mode]: {
        ...s[s.mode],
        session: createSession(items, type, key, title),
      },
    }));
    this.publish({ result: null });
  }
  decide(id: string, decision: Decision): boolean {
    const saved = this.snapshot.saved;
    const library = saved[saved.mode];
    const session = library.session;
    if (
      !this.snapshot.ready ||
      this.snapshot.busy ||
      this.snapshot.error ||
      !session ||
      session.mediaIds[session.currentIndex] !== id ||
      session.decisions[id] ||
      (decision === "delete" && library.bookmarks.includes(id))
    )
      return false;
    this.change((s) => {
      const library = s[s.mode];
      if (
        !library.session ||
        (decision === "delete" && library.bookmarks.includes(id))
      )
        return s;
      return {
        ...s,
        [s.mode]: {
          ...library,
          session: decide(library.session, id, decision),
        },
      };
    });
    return true;
  }
  undo() {
    this.change((s) => {
      const library = s[s.mode];
      return !library.session
        ? s
        : { ...s, [s.mode]: { ...library, session: undo(library.session) } };
    });
  }
  skipUnavailable(id: string) {
    this.change((s) => {
      const library = s[s.mode],
        session = library.session;
      if (
        !session ||
        session.mediaIds[session.currentIndex] !== id ||
        session.decisions[id]
      )
        return s;
      return {
        ...s,
        [s.mode]: {
          ...library,
          session: {
            ...session,
            mediaIds: session.mediaIds.filter((i) => i !== id),
            lastActiveTime: Date.now(),
          },
        },
      };
    });
  }
  async finish() {
    if (this.snapshot.busy) return;
    const s = this.snapshot.saved,
      before = s[s.mode],
      session = before.session;
    if (!session || pendingIds(session).length) return;
    const library = completeSession(before);
    this.publish({ busy: true });
    try {
      await this.update({ ...s, [s.mode]: library });
      this.publish({
        result: library.stats.cleanupLogs.find(
          (log) => log.id === session.id,
        ) ?? {
          id: session.id,
          date: "",
          sessionTitle: session.title,
          keptCount: 0,
          deletedCount: 0,
          bytesReclaimed: 0,
          unknownSizeCount: 0,
        },
      });
    } catch (error) {
      this.publish({ saved: s });
      throw error;
    } finally {
      this.publish({ busy: false });
    }
  }
  async deleteSelected(
    catalog: MediaItem[],
    selected: string[],
  ): Promise<string[]> {
    if (this.snapshot.busy) return [];
    const s = this.snapshot.saved,
      mode = s.mode,
      library = s[mode],
      session = library.session;
    if (!session) return [];
    const pending = new Set(pendingIds(session)),
      bookmarks = new Set(library.bookmarks);
    const chosen = [...new Set(selected)].filter(
      (id) => pending.has(id) && !bookmarks.has(id),
    );
    const items = chosen
      .map((id) => catalog.find((i) => i.id === id))
      .filter((i): i is MediaItem => !!i);
    if (items.length !== chosen.length)
      throw new Error(
        "Some marked items are no longer accessible. Reconnect your gallery and review again.",
      );
    if (items.some((i) => i.source !== mode))
      throw new Error("This selection belongs to another gallery.");
    const reviewed = { ...library, session: reviewSelection(session, chosen) };
    this.publish({ busy: true });
    try {
      // Persist intent before opening the system prompt; a process death never becomes a fabricated receipt.
      await this.update({
        ...s,
        [mode]: reviewed,
        deletionAttempt: chosen.length
          ? { mode, sessionId: session.id, ids: chosen }
          : undefined,
      });
      await this.repository.flush();
      const result = chosen.length
        ? await this.deleteDriver(items)
        : { deletedIds: [] };
      const confirmed = confirmDeleted(
        this.snapshot.saved[mode],
        catalog,
        result.deletedIds,
      );
      await this.update({
        ...this.snapshot.saved,
        [mode]: confirmed,
        deletionAttempt: undefined,
      });
      this.publish({ interrupted: false });
      if (result.error) throw new Error(result.error);
      return result.deletedIds;
    } finally {
      this.publish({ busy: false });
    }
  }
  clearResult() {
    this.publish({ result: null });
  }
  async resetCurrentLibrary() {
    if (this.snapshot.busy) return;
    const s = this.snapshot.saved;
    const deletionAttempt =
      s.deletionAttempt?.mode === s.mode ? undefined : s.deletionAttempt;
    await this.update({ ...s, [s.mode]: emptyLibrary(), deletionAttempt });
    this.publish({ result: null, interrupted: !!deletionAttempt });
  }
}
