/** Coalesce native events and defer reloads while backgrounded or confirming deletion. */
export class GalleryRefreshQueue {
  private enabled = false;
  private active = true;
  private blocked = false;
  private pending = false;
  private running = false;
  private timer: ReturnType<typeof setTimeout> | undefined;

  constructor(
    private refresh: () => Promise<void>,
    private delay = 300,
  ) {}

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (!enabled) {
      this.pending = false;
      if (this.timer !== undefined) clearTimeout(this.timer);
      this.timer = undefined;
    }
    this.schedule();
  }

  setActive(active: boolean) {
    const resumed = active && !this.active;
    this.active = active;
    if (resumed) this.request();
    this.schedule();
  }

  setBlocked(blocked: boolean) {
    this.blocked = blocked;
    this.schedule();
  }

  request = () => {
    if (!this.enabled) return;
    this.pending = true;
    this.schedule();
  };

  private schedule() {
    if (
      !this.enabled ||
      !this.active ||
      this.blocked ||
      this.running ||
      !this.pending ||
      this.timer !== undefined
    )
      return;
    this.timer = setTimeout(() => {
      this.timer = undefined;
      void this.drain();
    }, this.delay);
  }

  private async drain() {
    if (
      !this.enabled ||
      !this.active ||
      this.blocked ||
      this.running ||
      !this.pending
    )
      return;
    this.pending = false;
    this.running = true;
    try {
      await this.refresh();
    } catch {
      // GalleryLibrary publishes permission/loading errors; never invent a fallback.
    } finally {
      this.running = false;
      this.schedule();
    }
  }
}
