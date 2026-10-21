export interface MediaItem {
  id: string;
  uri: string;
  thumbnailUri?: string;
  filename: string;
  mediaType: 'photo' | 'video';
  width: number;
  height: number;
  creationTime: number; // unix timestamp in ms
  modificationTime: number;
  duration?: number; // duration in seconds if video
  fileSize: number; // in bytes
  albumName: string;
  isBookmarked?: boolean;
  source: 'demo' | 'local' | 'uploaded';
}

export type DecisionType = 'keep' | 'delete';

export interface CleanupSession {
  id: string;
  title: string;
  subtitle: string;
  collectionType: 'month' | 'recents' | 'random' | 'on_this_day' | 'album';
  collectionKey: string; // e.g., '2026-10', 'screenshots', 'recents'
  mediaIds: string[];
  currentIndex: number;
  decisions: Record<string, DecisionType>;
  history: string[]; // stack of mediaIds for undo
  isCompleted: boolean;
  createdAt: number;
  lastActiveTime: number;
}

export interface MonthCollection {
  key: string; // '2026-10'
  year: number;
  month: number;
  monthName: string; // 'October 2026'
  totalCount: number;
  reviewedCount: number;
  isCompleted: boolean;
  sampleThumbnail: string;
  totalBytes: number;
}

export interface AppStats {
  totalReviewed: number;
  totalKept: number;
  totalDeleted: number;
  bytesReclaimed: number;
  dailyStreak: number;
  lastCleanDate: string; // 'YYYY-MM-DD'
  cleanupLogs: {
    id: string;
    date: string;
    sessionTitle: string;
    keptCount: number;
    deletedCount: number;
    bytesReclaimed: number;
  }[];
}

export interface AppSettings {
  hapticsEnabled: boolean;
  reducedMotion: boolean;
  showReviewBeforeFinish: boolean;
  permissionState: 'granted' | 'limited' | 'denied';
  deviceFrameEnabled: boolean;
}
