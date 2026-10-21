export type MediaKind = "photo" | "video";
export type Decision = "keep" | "delete";
export type LibraryMode = "device" | "demo";
export type Permission =
  | "unknown"
  | "granted"
  | "limited"
  | "denied"
  | "unavailable";
export interface MediaItem {
  id: string;
  uri: string;
  thumbnailUri?: string;
  filename: string;
  mediaType: MediaKind;
  width: number;
  height: number;
  creationTime: number;
  modificationTime: number;
  duration?: number;
  fileSize?: number;
  albumId?: string;
  albumName: string;
  source: "device" | "demo";
}
export interface Session {
  id: string;
  title: string;
  subtitle: string;
  collectionType: string;
  collectionKey: string;
  mediaIds: string[];
  currentIndex: number;
  decisions: Record<string, Decision>;
  history: string[];
  createdAt: number;
  lastActiveTime: number;
  confirmedDeleted: { id: string; bytes: number; sizeKnown: boolean }[];
}
export interface CleanupLog {
  id: string;
  date: string;
  sessionTitle: string;
  keptCount: number;
  deletedCount: number;
  bytesReclaimed: number;
  unknownSizeCount: number;
}
export interface Stats {
  totalSessions: number;
  totalReviewed: number;
  totalKept: number;
  totalDeleted: number;
  bytesReclaimed: number;
  unknownSizeCount: number;
  dailyStreak: number;
  lastCleanDate: string;
  cleanupLogs: CleanupLog[];
}
export interface LibraryState {
  bookmarks: string[];
  progress: Record<string, Decision>;
  session: Session | null;
  stats: Stats;
  completedSessions: string[];
}
export interface Settings {
  hapticsEnabled: boolean;
  reducedMotion: boolean;
  showReviewBeforeFinish: boolean;
}
export interface SavedState {
  schema: 3;
  onboardingDone: boolean;
  name: string;
  joinedAt: number;
  mode: LibraryMode;
  settings: Settings;
  device: LibraryState;
  demo: LibraryState;
  deletionAttempt?: { mode: LibraryMode; sessionId: string; ids: string[] };
}
export interface Collection {
  key: string;
  title: string;
  items: MediaItem[];
  reviewedCount: number;
  isCompleted: boolean;
  totalBytes: number;
  unknownSizes: number;
}
export interface DeleteResult {
  deletedIds: string[];
  failedIds: string[];
  cancelled: boolean;
  error?: string;
}
