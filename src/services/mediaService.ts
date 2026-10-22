import { MediaItem, CleanupSession, MonthCollection, AppStats, AppSettings, DecisionType } from '../types/media';

// Device media is available only in the Expo native app.

const STORAGE_KEYS = {
  MEDIA: 'luma_media_library_v3',
  BOOKMARKS: 'luma_bookmarks',
  SESSION: 'luma_current_session',
  STATS: 'luma_app_stats',
  SETTINGS: 'luma_settings',
  COMPLETED_COLLECTIONS: 'luma_completed_collections',
  ONBOARDING_DONE: 'luma_onboarding_completed',
};

class MediaService {
  private mediaList: MediaItem[] = [];
  private bookmarkedIds: Set<string> = new Set();
  private completedCollections: Set<string> = new Set();
  private stats: AppStats = {
    totalReviewed: 0,
    totalKept: 0,
    totalDeleted: 0,
    bytesReclaimed: 0,
    dailyStreak: 1,
    lastCleanDate: new Date().toISOString().split('T')[0],
    cleanupLogs: [],
  };
  private settings: AppSettings = {
    hapticsEnabled: true,
    reducedMotion: false,
    showReviewBeforeFinish: true,
    permissionState: 'denied',
    deviceFrameEnabled: true,
  };

  constructor() {
    this.init();
  }

  private init() {
    try {
      // Never restore a browser sample catalog as an authorized device library.
      this.mediaList = [];

      const storedBookmarks = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
      if (storedBookmarks) {
        this.bookmarkedIds = new Set(JSON.parse(storedBookmarks));
      }

      const storedCompleted = localStorage.getItem(STORAGE_KEYS.COMPLETED_COLLECTIONS);
      if (storedCompleted) {
        this.completedCollections = new Set(JSON.parse(storedCompleted));
      }

      const storedStats = localStorage.getItem(STORAGE_KEYS.STATS);
      if (storedStats) {
        this.stats = JSON.parse(storedStats);
      }

      const storedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (storedSettings) {
        this.settings = { ...this.settings, ...JSON.parse(storedSettings), permissionState: 'denied' };
      }
    } catch {
      this.mediaList = [];
    }
  }

  // Resets all completed flags on months/collections so user can test swiping again
  public resetCompletedCollections() {
    this.completedCollections.clear();
    this.persistCompletedCollections();
  }

  private persistMedia() {
    try {
      localStorage.setItem(STORAGE_KEYS.MEDIA, JSON.stringify(this.mediaList));
    } catch {
      // storage full or quota exceeded
    }
  }

  private persistBookmarks() {
    try {
      localStorage.setItem(
        STORAGE_KEYS.BOOKMARKS,
        JSON.stringify(Array.from(this.bookmarkedIds))
      );
    } catch {
      // ignore
    }
  }

  private persistCompletedCollections() {
    try {
      localStorage.setItem(
        STORAGE_KEYS.COMPLETED_COLLECTIONS,
        JSON.stringify(Array.from(this.completedCollections))
      );
    } catch {
      // ignore
    }
  }

  public persistStats() {
    try {
      localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(this.stats));
    } catch {
      // ignore
    }
  }

  public persistSettings(newSettings: Partial<AppSettings>) {
    this.settings = { ...this.settings, ...newSettings, permissionState: 'denied' };
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(this.settings));
    } catch {
      // ignore
    }
    return this.settings;
  }

  public getSettings(): AppSettings {
    return { ...this.settings };
  }

  public isOnboardingDone(): boolean {
    return localStorage.getItem(STORAGE_KEYS.ONBOARDING_DONE) === 'true';
  }

  public setOnboardingDone(done: boolean = true) {
    localStorage.setItem(STORAGE_KEYS.ONBOARDING_DONE, done ? 'true' : 'false');
  }

  public getAllMedia(): MediaItem[] {
    return this.mediaList.map((item) => ({
      ...item,
      isBookmarked: this.bookmarkedIds.has(item.id),
    }));
  }

  public getMediaById(id: string): MediaItem | undefined {
    const item = this.mediaList.find((m) => m.id === id);
    if (!item) return undefined;
    return {
      ...item,
      isBookmarked: this.bookmarkedIds.has(item.id),
    };
  }

  public toggleBookmark(id: string): boolean {
    if (this.bookmarkedIds.has(id)) {
      this.bookmarkedIds.delete(id);
    } else {
      this.bookmarkedIds.add(id);
    }
    this.persistBookmarks();
    return this.bookmarkedIds.has(id);
  }

  public getBookmarks(): MediaItem[] {
    return this.getAllMedia().filter((m) => this.bookmarkedIds.has(m.id));
  }

  public addUploadedMedia(items: MediaItem[]) {
    throw new Error('Use the native app to connect your device photo library.');
  }

  // Month collections breakdown
  public getMonthCollections(): MonthCollection[] {
    const groups: Record<string, { items: MediaItem[]; year: number; month: number }> = {};
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    for (const item of this.mediaList) {
      const date = new Date(item.creationTime);
      const year = date.getFullYear();
      const month = date.getMonth(); // 0-11
      const key = `${year}-${String(month + 1).padStart(2, '0')}`;

      if (!groups[key]) {
        groups[key] = { items: [], year, month };
      }
      groups[key].items.push(item);
    }

    const collections: MonthCollection[] = Object.entries(groups).map(([key, group]) => {
      const totalBytes = group.items.reduce((sum, it) => sum + it.fileSize, 0);
      const isCompleted = this.completedCollections.has(key);
      const sampleThumbnail = group.items[0]?.thumbnailUri || group.items[0]?.uri || '';

      return {
        key,
        year: group.year,
        month: group.month,
        monthName: `${monthNames[group.month]} ${group.year}`,
        totalCount: group.items.length,
        reviewedCount: isCompleted ? group.items.length : 0,
        isCompleted,
        sampleThumbnail,
        totalBytes,
      };
    });

    // Sort descending by date
    return collections.sort((a, b) => b.key.localeCompare(a.key));
  }

  public getAlbums(): { name: string; count: number; sampleThumbnail: string }[] {
    const albumMap: Record<string, MediaItem[]> = {};
    for (const item of this.mediaList) {
      const alb = item.albumName || 'Camera';
      if (!albumMap[alb]) albumMap[alb] = [];
      albumMap[alb].push(item);
    }

    return Object.entries(albumMap).map(([name, list]) => ({
      name,
      count: list.length,
      sampleThumbnail: list[0]?.thumbnailUri || list[0]?.uri || '',
    }));
  }

  // Fast entry points
  public getRecents(count = 20): MediaItem[] {
    return [...this.mediaList]
      .sort((a, b) => b.creationTime - a.creationTime)
      .slice(0, count);
  }

  public getRandomSelection(count = 15): MediaItem[] {
    const shuffled = [...this.mediaList].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  public getOnThisDay(): MediaItem[] {
    const today = new Date();
    const todayMonth = today.getMonth();
    const todayDate = today.getDate();

    return this.mediaList.filter((item) => {
      const d = new Date(item.creationTime);
      return (
        d.getMonth() === todayMonth &&
        d.getDate() === todayDate &&
        d.getFullYear() < today.getFullYear()
      );
    });
  }

  // Smart Categories Inspired by Cleaner Guru & Cleaner AI
  public getSimilarAndDuplicates(): MediaItem[] {
    return this.mediaList.filter((item) => {
      const fn = item.filename.toLowerCase();
      return (
        fn.includes('burst') ||
        fn.includes('blur') ||
        fn.includes('01') ||
        fn.includes('02') ||
        fn.includes('copy') ||
        fn.includes('duplicate') ||
        item.id === 'demo-3' ||
        item.id === 'demo-4'
      );
    });
  }

  public getScreenshots(): MediaItem[] {
    return this.mediaList.filter(
      (item) =>
        (item.albumName && item.albumName.toLowerCase().includes('screenshot')) ||
        item.filename.toLowerCase().includes('screenshot')
    );
  }

  public getLargeVideos(): MediaItem[] {
    return this.mediaList
      .filter((item) => item.mediaType === 'video')
      .sort((a, b) => b.fileSize - a.fileSize);
  }

  public getBlurryPhotos(): MediaItem[] {
    return this.mediaList.filter(
      (item) =>
        item.filename.toLowerCase().includes('blur') ||
        item.filename.toLowerCase().includes('mist') ||
        item.id === 'demo-4'
    );
  }

  // Storage breakdown calculations
  public getStorageBreakdown() {
    let totalPhotosSize = 0;
    let totalVideosSize = 0;
    let totalScreenshotsSize = 0;
    let totalDuplicatesSize = 0;
    let photoCount = 0;
    let videoCount = 0;
    let screenshotCount = 0;
    let duplicateCount = 0;

    const screenshots = this.getScreenshots();
    const duplicates = this.getSimilarAndDuplicates();
    const screenshotIds = new Set(screenshots.map((s) => s.id));
    const duplicateIds = new Set(duplicates.map((d) => d.id));

    for (const item of this.mediaList) {
      if (item.mediaType === 'video') {
        totalVideosSize += item.fileSize;
        videoCount += 1;
      } else {
        totalPhotosSize += item.fileSize;
        photoCount += 1;
      }

      if (screenshotIds.has(item.id)) {
        totalScreenshotsSize += item.fileSize;
        screenshotCount += 1;
      }
      if (duplicateIds.has(item.id)) {
        totalDuplicatesSize += item.fileSize;
        duplicateCount += 1;
      }
    }

    const totalMediaBytes = totalPhotosSize + totalVideosSize;
    // Recoverable space estimate (duplicates + screenshots + reclaimable)
    const recoverableBytes = totalDuplicatesSize + Math.round(totalScreenshotsSize * 0.7);

    // Realistic device disk mockup (e.g. 64 GB storage device with 44.8 GB used by system/apps + media)
    const deviceCapacityBytes = 64 * 1024 * 1024 * 1024; // 64 GB
    const baseUsedBytes = 41.2 * 1024 * 1024 * 1024; // system, apps, caches
    const usedBytes = baseUsedBytes + totalMediaBytes - this.stats.bytesReclaimed;
    const freeBytes = Math.max(deviceCapacityBytes - usedBytes, 0);

    return {
      totalMediaBytes,
      totalPhotosSize,
      totalVideosSize,
      totalScreenshotsSize,
      totalDuplicatesSize,
      recoverableBytes,
      photoCount,
      videoCount,
      screenshotCount,
      duplicateCount,
      deviceCapacityBytes,
      usedBytes,
      freeBytes,
      usedPercentage: Math.min(Math.round((usedBytes / deviceCapacityBytes) * 100), 99),
    };
  }

  public getGalleryHealthScore(): number {
    const total = this.mediaList.length;
    if (total === 0) return 100;
    const duplicates = this.getSimilarAndDuplicates().length;
    const screenshots = this.getScreenshots().length;
    const uncleanedClutter = duplicates + screenshots;
    const penalty = Math.min(Math.round((uncleanedClutter / total) * 35), 35);
    const bonus = Math.min(Math.round(this.stats.totalReviewed * 2), 20);
    return Math.min(Math.max(82 - penalty + bonus, 68), 99);
  }

  // Session persistence
  public getSavedSession(): CleanupSession | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SESSION);
      if (!data) return null;
      const session: CleanupSession = JSON.parse(data);
      // Validate that mediaIds still exist in the current mediaList
      const currentIds = new Set(this.mediaList.map((m) => m.id));
      const validMediaIds = session.mediaIds.filter((id) => currentIds.has(id));
      if (validMediaIds.length === 0 || session.isCompleted) {
        this.clearSession();
        return null;
      }
      return {
        ...session,
        mediaIds: validMediaIds,
      };
    } catch {
      return null;
    }
  }

  public saveSession(session: CleanupSession) {
    try {
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
    } catch {
      // ignore
    }
  }

  public clearSession() {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  }

  public createSession(
    collectionType: CleanupSession['collectionType'],
    collectionKey: string,
    title: string,
    subtitle: string,
    mediaItems: MediaItem[]
  ): CleanupSession {
    const session: CleanupSession = {
      id: `session_${Date.now()}`,
      title,
      subtitle,
      collectionType,
      collectionKey,
      mediaIds: mediaItems.map((m) => m.id),
      currentIndex: 0,
      decisions: {},
      history: [],
      isCompleted: false,
      createdAt: Date.now(),
      lastActiveTime: Date.now(),
    };
    this.saveSession(session);
    return session;
  }

  // Deletion execution & reconciliation
  public deleteMediaBatch(idsToDelete: string[]): {
    deletedCount: number;
    bytesReclaimed: number;
    remainingItems: MediaItem[];
  } {
    throw new Error('Use the native app. A browser cannot request system photo deletion confirmation.');
  }

  public completeSession(session: CleanupSession) {
    this.completedCollections.add(session.collectionKey);
    this.persistCompletedCollections();
    this.clearSession();
  }

  public updateStatsAfterCleanup(keptCount: number, deletedCount: number, bytesReclaimed: number) {
    const todayStr = new Date().toISOString().split('T')[0];
    const prevDateStr = this.stats.lastCleanDate;

    let newStreak = this.stats.dailyStreak;
    if (prevDateStr !== todayStr) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (prevDateStr === yesterdayStr) {
        newStreak += 1;
      } else {
        newStreak = 1; // streak reset if skipped day
      }
    }

    this.stats = {
      ...this.stats,
      totalReviewed: this.stats.totalReviewed + keptCount + deletedCount,
      totalKept: this.stats.totalKept + keptCount,
      totalDeleted: this.stats.totalDeleted + deletedCount,
      bytesReclaimed: this.stats.bytesReclaimed + bytesReclaimed,
      dailyStreak: newStreak,
      lastCleanDate: todayStr,
      cleanupLogs: [
        {
          id: `log_${Date.now()}`,
          date: todayStr,
          sessionTitle: `Cleaned on ${todayStr}`,
          keptCount,
          deletedCount,
          bytesReclaimed,
        },
        ...this.stats.cleanupLogs.slice(0, 30), // keep last 30 logs
      ],
    };

    this.persistStats();
  }

  public getStats(): AppStats {
    return { ...this.stats };
  }

  public resetAllData() {
    localStorage.clear();
    this.mediaList = [];
    this.bookmarkedIds = new Set();
    this.completedCollections = new Set();
    this.stats = {
      totalReviewed: 0,
      totalKept: 0,
      totalDeleted: 0,
      bytesReclaimed: 0,
      dailyStreak: 1,
      lastCleanDate: new Date().toISOString().split('T')[0],
      cleanupLogs: [],
    };
    this.persistMedia();
    this.persistBookmarks();
    this.persistCompletedCollections();
    this.persistStats();
  }
}

export const mediaService = new MediaService();

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function formatDate(timestamp: number): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }).format(new Date(timestamp));
}
