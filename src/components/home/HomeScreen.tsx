import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CleanupSession,
  MonthCollection,
  MediaItem,
} from '../../types/media';
import { mediaService, formatBytes } from '../../services/mediaService';
import {
  Sparkles,
  Flame,
  HardDrive,
  Play,
  CheckCircle2,
  ChevronRight,
  Trash2,
  Layers,
  Film,
  Camera,
  Image as ImageIcon,
  Zap,
  Calendar,
  Clock,
  ShieldAlert,
  ArrowRight,
  Smartphone,
  RefreshCw,
} from 'lucide-react';

interface HomeScreenProps {
  savedSession: CleanupSession | null;
  monthCollections: MonthCollection[];
  albums: { name: string; count: number; sampleThumbnail: string }[];
  onStartSession: (
    type: CleanupSession['collectionType'],
    key: string,
    title: string,
    subtitle: string,
    items: MediaItem[]
  ) => void;
  onResumeSession: () => void;
  dailyStreak: number;
  totalDeleted: number;
  bytesReclaimed: number;
  permissionState?: 'granted' | 'limited' | 'denied';
  onOpenSettings?: () => void;
  onNativeRequired?: () => void;
  onImportMedia?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  savedSession,
  monthCollections,
  albums,
  onStartSession,
  onResumeSession,
  dailyStreak,
  totalDeleted,
  bytesReclaimed,
  permissionState = 'granted',
  onOpenSettings,
  onNativeRequired,
  onImportMedia,
}) => {
  const [collectionFilter, setCollectionFilter] = useState<'all' | 'uncleaned' | 'completed'>('all');
  const [activeTabSection, setActiveTabSection] = useState<'months' | 'categories' | 'albums'>('months');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Compute live storage breakdown & smart categories
  const allMedia = mediaService.getAllMedia();
  const totalPhotosCount = allMedia.length;
  const storage = mediaService.getStorageBreakdown();
  const healthScore = mediaService.getGalleryHealthScore();
  const similarItems = mediaService.getSimilarAndDuplicates();
  const screenshotItems = mediaService.getScreenshots();
  const videoItems = mediaService.getLargeVideos();
  const blurryItems = mediaService.getBlurryPhotos();
  const onThisDayItems = mediaService.getOnThisDay();

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleNativeRequired = () => onNativeRequired?.();

  // Time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Quick Smart Cleanup: Automatically aggregates highest-value clutter (duplicates + screenshots)
  const handleQuickClean = () => {
    let clutter = [...similarItems, ...screenshotItems].filter(
      (item, idx, self) => self.findIndex((i) => i.id === item.id) === idx
    );
    if (clutter.length === 0) {
      // If no detected clutter, take recent or all media
      clutter = mediaService.getRecents(20);
    }
    if (clutter.length === 0) {
      handleNativeRequired();
      return;
    }

    if (clutter.length > 0) {
      onStartSession(
        'random',
        'smart_clean',
        'Smart Clean',
        `${clutter.length} items ready to review`,
        clutter
      );
    }
  };

  const handleStartCategory = (
    key: string,
    title: string,
    subtitle: string,
    items: MediaItem[]
  ) => {
    let list = items;
    if (list.length === 0) {
      // Fallback: provide recent media so the user can still test swiping
      list = mediaService.getRecents(15);
    }
    if (list.length > 0) {
      onStartSession('random', key, title, subtitle, list);
    }
  };

  const handleStartMonth = (col: MonthCollection) => {
    const all = mediaService.getAllMedia();
    let monthItems = all.filter((it) => {
      const d = new Date(it.creationTime);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      return key === col.key;
    });

    if (monthItems.length === 0) {
      handleNativeRequired();
      return;
    }

    if (monthItems.length > 0) {
      onStartSession('month', col.key, col.monthName, `${monthItems.length} photos & videos`, monthItems);
    }
  };

  const handleStartAlbum = (albumName: string) => {
    const all = mediaService.getAllMedia();
    let albumItems = all.filter((it) => (it.albumName || 'Camera') === albumName);
    if (albumItems.length === 0) {
      albumItems = mediaService.getRecents(15);
    }
    if (albumItems.length > 0) {
      onStartSession('album', albumName.toLowerCase(), albumName, `${albumItems.length} items in album`, albumItems);
    }
  };

  // Filtered month collections
  const filteredCollections = monthCollections.filter((col) => {
    if (collectionFilter === 'uncleaned') return !col.isCompleted;
    if (collectionFilter === 'completed') return col.isCompleted;
    return true;
  });

  return (
    <div className="space-y-6 pb-28 pt-2">
      {/* Native gallery access is unavailable in a browser. */}
      {permissionState !== 'granted' && (
        <div className="mx-4 p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-[#18231F] block">
                Use the native app
              </span>
              <span className="text-[#737B75] text-[11px]">
                Connect your device photo library on Android or iOS.
              </span>
            </div>
          </div>
          {onOpenSettings && (
            <button
              onClick={handleNativeRequired}
              className="px-3 py-1.5 bg-[#244D3F] text-white text-[11px] font-bold rounded-xl shrink-0 cursor-pointer hover:bg-[#18231F] transition-all"
            >
              Use the native app
            </button>
          )}
        </div>
      )}

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="mx-4 p-3 bg-[#18231F] text-[#F8F7F3] rounded-2xl shadow-xl border border-[#244D3F] flex items-center justify-between text-xs font-semibold z-30"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#DCE8B0] shrink-0" />
              <span>{toastMsg}</span>
            </div>
            <button
              onClick={() => setToastMsg(null)}
              className="text-white/60 hover:text-white text-xs px-1.5 py-0.5"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header & Streak Pill */}
      <section className="px-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#2D8060] uppercase tracking-wider mb-0.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Gallery Optimizer</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-[#18231F]">
              {getGreeting()}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-xs text-[#737B75]">
                Make room for memories you cherish.
              </p>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#244D3F]/10 text-[#244D3F] text-[10px] font-bold rounded-md">
                <ImageIcon className="w-3 h-3" />
                {totalPhotosCount} photos
              </span>
            </div>
          </div>

          {/* Daily streak indicator */}
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-[#E6E9E2] rounded-2xl shadow-xs">
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />
            <div className="text-right">
              <span className="text-xs font-extrabold text-[#18231F] tabular-nums block leading-none">
                {dailyStreak}d
              </span>
              <span className="text-[9px] text-[#737B75] uppercase font-bold tracking-tight">Streak</span>
            </div>
          </div>
        </div>

        {/* Device library access action */}
        <div className="mt-3.5 flex flex-wrap items-center gap-2">
          <button
            onClick={handleNativeRequired}
            className="flex-1 min-w-[140px] min-h-[40px] px-3.5 py-2 bg-[#244D3F] hover:bg-[#18231F] text-white rounded-2xl shadow-xs flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer active:scale-97"
            title="Connect your photo library in the native app"
          >
            <Sparkles className="w-4 h-4 text-[#DCE8B0]" />
            <span>Use the native app</span>
          </button>


          {onImportMedia && (
            <button
              onClick={onImportMedia}
              className="min-h-[40px] px-3.5 py-2 bg-[#F8F7F3] hover:bg-white border border-[#E6E9E2] rounded-2xl flex items-center justify-center gap-1.5 text-xs font-semibold text-[#18231F] transition-all cursor-pointer active:scale-97"
              title="Import device photos"
            >
              <Camera className="w-3.5 h-3.5 text-[#737B75]" />
              <span>Import</span>
            </button>
          )}
        </div>

        {/* Empty browser gallery */}
        {totalPhotosCount < 10 && (
          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-amber-900 font-semibold">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Use the native app to see your photos.</span>
            </div>
            <button
              onClick={handleNativeRequired}
              className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              Open native app
            </button>
          </div>
        )}
      </section>

      {/* Hero Storage Dial & Smart Scan Card (Cleaner Guru / Cleaner AI inspired) */}
      <section className="px-4">
        <div className="relative rounded-3xl bg-linear-to-br from-[#1E3B31] via-[#244D3F] to-[#18231F] text-white p-5 shadow-lg overflow-hidden border border-[#2D8060]/30">
          {/* Ambient luminous glow background */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#DCE8B0]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-[#2D8060]/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            {/* Top row: Gallery Health & Used space */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-center text-[#DCE8B0]">
                  <HardDrive className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-white/70">Device Storage</div>
                  <div className="text-sm font-extrabold text-white">
                    {storage.usedPercentage}% Used <span className="text-xs font-normal text-white/60">· 64 GB Total</span>
                  </div>
                </div>
              </div>

              {/* Health Score Pill */}
              <div className="px-3 py-1 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-right">
                <div className="text-[9px] uppercase tracking-wider text-[#DCE8B0] font-bold">Health Score</div>
                <div className="text-sm font-extrabold text-white tabular-nums">
                  {healthScore}%
                </div>
              </div>
            </div>

            {/* Storage Distribution Segmented Bar */}
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-xs text-white/80">
                <span className="font-medium">Media Storage Breakdown</span>
                <span className="tabular-nums font-mono text-white text-[11px]">
                  {formatBytes(storage.totalMediaBytes)} in library
                </span>
              </div>

              {/* Multi-segment visual bar */}
              <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden flex p-0.5 gap-0.5">
                {/* Photos */}
                <div
                  style={{
                    width: `${Math.max(
                      (storage.totalPhotosSize / (storage.totalMediaBytes || 1)) * 100,
                      15
                    )}%`,
                  }}
                  className="bg-[#2D8060] h-full rounded-l-full transition-all duration-500"
                  title="Photos"
                />
                {/* Videos */}
                <div
                  style={{
                    width: `${Math.max(
                      (storage.totalVideosSize / (storage.totalMediaBytes || 1)) * 100,
                      15
                    )}%`,
                  }}
                  className="bg-[#DCE8B0] h-full transition-all duration-500"
                  title="Videos"
                />
                {/* Screenshots */}
                <div
                  style={{
                    width: `${Math.max(
                      (storage.totalScreenshotsSize / (storage.totalMediaBytes || 1)) * 100,
                      10
                    )}%`,
                  }}
                  className="bg-[#C86462] h-full transition-all duration-500"
                  title="Screenshots"
                />
                {/* Free headroom */}
                <div className="bg-white/20 h-full flex-1 rounded-r-full" title="Available" />
              </div>

              {/* Bar Legend */}
              <div className="flex items-center justify-between text-[10px] text-white/70 pt-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#2D8060]" />
                  <span>Photos ({storage.photoCount})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#DCE8B0]" />
                  <span>Videos ({storage.videoCount})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#C86462]" />
                  <span>Screenshots ({storage.screenshotCount})</span>
                </div>
              </div>
            </div>

            {/* Smart Clean CTA Banner */}
            <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
              <div>
                <div className="text-xs text-white/70">Recoverable clutter found</div>
                <div className="text-lg font-black text-[#DCE8B0] tabular-nums tracking-tight">
                  ~{formatBytes(storage.recoverableBytes)}
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleQuickClean}
                className="px-4 py-2.5 bg-[#DCE8B0] hover:bg-white text-[#18231F] font-extrabold text-xs rounded-2xl flex items-center gap-2 shadow-md cursor-pointer transition-all"
              >
                <Zap className="w-3.5 h-3.5 text-[#244D3F] fill-[#244D3F]" />
                <span>Smart Clean</span>
              </motion.button>
            </div>
          </div>
        </div>
      </section>

      {/* Resumption Hero Card: "Continue Cleaning" (if a session was paused) */}
      {savedSession && (
        <section className="px-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-3xl bg-white border-2 border-[#244D3F]/25 shadow-sm space-y-3 relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2D8060] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#2D8060]" />
                </span>
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#244D3F]">
                  In Progress
                </span>
              </div>
              <span className="text-[11px] font-bold text-[#737B75] tabular-nums">
                {savedSession.currentIndex + 1} of {savedSession.mediaIds.length} reviewed
              </span>
            </div>

            <div className="flex items-center gap-3.5">
              {/* Thumbnail snapshot of current item */}
              {(() => {
                const currentItem = mediaService.getMediaById(
                  savedSession.mediaIds[savedSession.currentIndex] || savedSession.mediaIds[0]
                );
                return (
                  <div className="w-14 h-14 rounded-2xl overflow-hidden border border-[#E6E9E2] bg-slate-100 shrink-0">
                    <img
                      src={currentItem?.thumbnailUri || currentItem?.uri || ''}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                );
              })()}

              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-[#18231F] truncate">
                  {savedSession.title}
                </h4>
                <p className="text-xs text-[#737B75] truncate mt-0.5">
                  {savedSession.subtitle}
                </p>

                {/* Progress bar */}
                <div className="w-full bg-[#E6E9E2] h-1.5 rounded-full overflow-hidden mt-2">
                  <div
                    className="bg-[#244D3F] h-full rounded-full transition-all"
                    style={{
                      width: `${Math.round(
                        ((savedSession.currentIndex + 1) / savedSession.mediaIds.length) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <button
                onClick={onResumeSession}
                className="w-11 h-11 rounded-2xl bg-[#244D3F] hover:bg-[#18231F] text-white flex items-center justify-center shrink-0 shadow-md active:scale-95 transition-all cursor-pointer"
                aria-label="Resume swiping"
              >
                <Play className="w-4 h-4 fill-white ml-0.5" />
              </button>
            </div>
          </motion.div>
        </section>
      )}

      {/* Smart Category Cards Grid (Phone Cleaner & Cleaner Guru inspiration) */}
      <section className="px-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-[#18231F] tracking-tight">
              Smart Categories
            </h2>
            <p className="text-[11px] text-[#737B75]">
              AI-grouped collections ready for quick review
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Similar & Duplicates */}
          <motion.div
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() =>
              handleStartCategory(
                'duplicates',
                'Similar & Duplicates',
                `${similarItems.length} duplicate shots`,
                similarItems
              )
            }
            className="p-3.5 bg-white rounded-3xl border border-[#E6E9E2] shadow-xs hover:border-[#244D3F]/40 cursor-pointer transition-all flex flex-col justify-between space-y-3"
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-2xl bg-[#DCE8B0]/50 flex items-center justify-center text-[#244D3F]">
                <Layers className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-[#2D8060] bg-emerald-50 px-2 py-0.5 rounded-lg tabular-nums">
                {similarItems.length} items
              </span>
            </div>

            <div>
              <h3 className="text-xs font-bold text-[#18231F] leading-tight">
                Similar & Duplicates
              </h3>
              <p className="text-[11px] text-[#737B75] mt-0.5 tabular-nums">
                {formatBytes(storage.totalDuplicatesSize)}
              </p>
            </div>
          </motion.div>

          {/* Screenshots */}
          <motion.div
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() =>
              handleStartCategory(
                'screenshots',
                'Screenshots',
                `${screenshotItems.length} old captures`,
                screenshotItems
              )
            }
            className="p-3.5 bg-white rounded-3xl border border-[#E6E9E2] shadow-xs hover:border-[#244D3F]/40 cursor-pointer transition-all flex flex-col justify-between space-y-3"
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-700">
                <Camera className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-lg tabular-nums">
                {screenshotItems.length} items
              </span>
            </div>

            <div>
              <h3 className="text-xs font-bold text-[#18231F] leading-tight">
                Screenshots
              </h3>
              <p className="text-[11px] text-[#737B75] mt-0.5 tabular-nums">
                {formatBytes(storage.totalScreenshotsSize)}
              </p>
            </div>
          </motion.div>

          {/* Large Videos */}
          <motion.div
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() =>
              handleStartCategory(
                'videos',
                'Large Videos',
                `${videoItems.length} storage-heavy clips`,
                videoItems
              )
            }
            className="p-3.5 bg-white rounded-3xl border border-[#E6E9E2] shadow-xs hover:border-[#244D3F]/40 cursor-pointer transition-all flex flex-col justify-between space-y-3"
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-700">
                <Film className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-lg tabular-nums">
                {videoItems.length} clips
              </span>
            </div>

            <div>
              <h3 className="text-xs font-bold text-[#18231F] leading-tight">
                Large Videos
              </h3>
              <p className="text-[11px] text-[#737B75] mt-0.5 tabular-nums">
                {formatBytes(storage.totalVideosSize)}
              </p>
            </div>
          </motion.div>

          {/* Blurry & Low Quality */}
          <motion.div
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() =>
              handleStartCategory(
                'blurry',
                'Blurry & Low Quality',
                `${blurryItems.length} unclear snapshots`,
                blurryItems
              )
            }
            className="p-3.5 bg-white rounded-3xl border border-[#E6E9E2] shadow-xs hover:border-[#244D3F]/40 cursor-pointer transition-all flex flex-col justify-between space-y-3"
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center text-[#C86462]">
                <Trash2 className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-[#C86462] bg-red-50 px-2 py-0.5 rounded-lg tabular-nums">
                {blurryItems.length} items
              </span>
            </div>

            <div>
              <h3 className="text-xs font-bold text-[#18231F] leading-tight">
                Blurry & Bursts
              </h3>
              <p className="text-[11px] text-[#737B75] mt-0.5 tabular-nums">
                Review & Clean
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Section Switcher: Month Timeline vs Albums */}
      <section className="px-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 p-1 bg-white border border-[#E6E9E2] rounded-2xl shadow-xs">
            <button
              onClick={() => setActiveTabSection('months')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTabSection === 'months'
                  ? 'bg-[#244D3F] text-white shadow-2xs'
                  : 'text-[#737B75] hover:text-[#18231F]'
              }`}
            >
              Month Stacks
            </button>
            <button
              onClick={() => setActiveTabSection('albums')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTabSection === 'albums'
                  ? 'bg-[#244D3F] text-white shadow-2xs'
                  : 'text-[#737B75] hover:text-[#18231F]'
              }`}
            >
              Albums ({albums.length})
            </button>
          </div>

          {activeTabSection === 'months' && (
            <div className="flex items-center gap-1 text-[11px]">
              {(['all', 'uncleaned', 'completed'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setCollectionFilter(filter)}
                  className={`px-2.5 py-1 rounded-lg capitalize transition-colors cursor-pointer ${
                    collectionFilter === filter
                      ? 'bg-[#E6E9E2] text-[#18231F] font-bold'
                      : 'text-[#737B75] hover:text-[#18231F]'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content Views */}
        {activeTabSection === 'months' ? (
          <div className="space-y-3">
            {filteredCollections.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-3xl border border-[#E6E9E2] text-[#737B75] space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#DCE8B0]/60 text-[#244D3F] flex items-center justify-center mx-auto">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-extrabold text-[#18231F]">No active collections</p>
                  <p className="text-xs text-[#737B75] mt-1">
                    Use the native app to connect your device photo library.
                  </p>
                </div>
                <button
                  onClick={handleNativeRequired}
                  className="px-5 py-2.5 bg-[#244D3F] hover:bg-[#18231F] text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#DCE8B0]" />
                  <span>Use the native app</span>
                </button>
              </div>
            ) : (
              filteredCollections.map((col) => (
                <motion.div
                  key={col.key}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => handleStartMonth(col)}
                  className="p-3.5 bg-white rounded-3xl border border-[#E6E9E2] shadow-xs hover:border-[#244D3F]/40 cursor-pointer transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Month cover image with photo stack styling */}
                    <div className="relative w-14 h-14 shrink-0">
                      <div className="absolute inset-0 bg-[#E6E9E2] rounded-2xl rotate-3 scale-95" />
                      <div className="relative w-full h-full rounded-2xl overflow-hidden border border-[#E6E9E2] bg-slate-100 shadow-2xs">
                        <img
                          src={col.sampleThumbnail}
                          alt={col.monthName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-[#18231F] truncate">
                          {col.monthName}
                        </h4>
                        {col.isCompleted && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-[#2D8060] bg-emerald-50 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" />
                            Cleaned
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-[#737B75] mt-0.5">
                        <span className="tabular-nums">{col.totalCount} items</span>
                        <span>·</span>
                        <span className="tabular-nums font-mono">{formatBytes(col.totalBytes)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-bold text-[#244D3F] hover:underline hidden sm:inline">
                      {col.isCompleted ? 'Review Again' : 'Clean'}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-[#F8F7F3] flex items-center justify-center text-[#737B75]">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        ) : (
          /* Albums View */
          <div className="grid grid-cols-2 gap-3">
            {albums.map((alb) => (
              <motion.div
                key={alb.name}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleStartAlbum(alb.name)}
                className="p-3 bg-white rounded-3xl border border-[#E6E9E2] shadow-xs hover:border-[#244D3F]/40 cursor-pointer transition-all space-y-2.5"
              >
                <div className="aspect-4/3 rounded-2xl overflow-hidden border border-[#E6E9E2] bg-slate-100 relative">
                  <img
                    src={alb.sampleThumbnail}
                    alt={alb.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md text-white text-[10px] font-bold">
                    {alb.count}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-[#18231F] truncate">
                    {alb.name}
                  </h4>
                  <p className="text-[11px] text-[#737B75]">
                    Tap to review album
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Memory Flashback / On This Day Widget */}
      {onThisDayItems.length > 0 && (
        <section className="px-4">
          <div className="p-4 rounded-3xl bg-linear-to-r from-amber-50 to-orange-50 border border-amber-200/60 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-amber-950">
                  On This Day Flashback
                </h4>
                <p className="text-[11px] text-amber-800">
                  {onThisDayItems.length} photos captured on this calendar day in past years.
                </p>
              </div>
            </div>

            <button
              onClick={() =>
                onStartSession(
                  'on_this_day',
                  'on_this_day',
                  'On This Day',
                  'Memories from this date',
                  onThisDayItems
                )
              }
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
            >
              Relive
            </button>
          </div>
        </section>
      )}
    </div>
  );
};
