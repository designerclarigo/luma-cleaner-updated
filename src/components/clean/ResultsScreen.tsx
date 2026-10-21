import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { formatBytes, mediaService } from '../../services/mediaService';
import {
  CheckCircle2,
  HardDrive,
  Trash2,
  Heart,
  ArrowRight,
  Flame,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Layers,
} from 'lucide-react';

interface ResultsScreenProps {
  sessionTitle: string;
  keptCount: number;
  deletedCount: number;
  bytesReclaimed: number;
  dailyStreak: number;
  onCleanAnother: () => void;
  onGoHome: () => void;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({
  sessionTitle,
  keptCount,
  deletedCount,
  bytesReclaimed,
  dailyStreak,
  onCleanAnother,
  onGoHome,
}) => {
  const [animatedBytes, setAnimatedBytes] = useState(0);
  const healthScore = mediaService.getGalleryHealthScore();

  // Find next uncleaned month collection to recommend
  const uncleanedCollections = mediaService
    .getMonthCollections()
    .filter((c) => !c.isCompleted);
  const nextRecommended = uncleanedCollections[0];

  useEffect(() => {
    // Elegant, restrained confetti burst
    confetti({
      particleCount: 45,
      spread: 55,
      origin: { y: 0.55 },
      colors: ['#244D3F', '#DCE8B0', '#2D8060', '#F8F7F3'],
      disableForReducedMotion: true,
    });

    // Smooth counting up animation for reclaimed bytes
    let start = 0;
    const duration = 800; // ms
    const stepTime = 20;
    const steps = duration / stepTime;
    const increment = bytesReclaimed / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= bytesReclaimed) {
        setAnimatedBytes(bytesReclaimed);
        clearInterval(timer);
      } else {
        setAnimatedBytes(Math.round(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [bytesReclaimed]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] px-4 py-8 text-center max-w-md mx-auto select-none">
      {/* Luminous Animated Badge */}
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 14, stiffness: 200 }}
        className="relative mb-4"
      >
        <div className="w-22 h-22 rounded-3xl bg-linear-to-br from-[#2D8060] to-[#244D3F] text-white flex items-center justify-center shadow-xl border-4 border-white">
          <CheckCircle2 className="w-12 h-12 stroke-[2.5]" />
        </div>
        <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-[#DCE8B0] border-2 border-white flex items-center justify-center text-[#244D3F] shadow-sm">
          <Sparkles className="w-4 h-4" />
        </div>
      </motion.div>

      <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#2D8060] bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-200/50 mb-2">
        Collection Organized
      </span>

      <h1 className="text-2xl font-black tracking-tight text-[#18231F]">
        Clutter Cleared. Memories Kept.
      </h1>
      <p className="text-xs text-[#737B75] mt-1 max-w-xs leading-relaxed">
        <strong>{sessionTitle}</strong> is optimized. Your device storage has been updated.
      </p>

      {/* Main Metric Spotlight Card */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="w-full bg-white rounded-3xl p-5 border border-[#E6E9E2] shadow-sm my-6 space-y-4"
      >
        {/* Storage Reclaimed Spotlight Banner */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-linear-to-br from-[#244D3F] to-[#18231F] text-white">
          <div className="flex items-center gap-3 text-left">
            <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-[#DCE8B0] border border-white/15">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-white/70">Space Reclaimed</div>
              <div className="text-2xl font-black text-[#DCE8B0] tabular-nums tracking-tight">
                {bytesReclaimed > 0 ? formatBytes(animatedBytes) : 'Storage Optimized'}
              </div>
            </div>
          </div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-300 bg-white/10 px-2.5 py-1 rounded-xl">
            Verified
          </span>
        </div>

        {/* 2-Column Metrics */}
        <div className="grid grid-cols-2 gap-3 text-left">
          {/* Kept */}
          <div className="p-3.5 rounded-2xl bg-[#F8F7F3] border border-[#E6E9E2]/70">
            <div className="flex items-center gap-1.5 text-xs text-[#737B75] mb-1 font-semibold">
              <Heart className="w-3.5 h-3.5 text-[#2D8060] fill-[#2D8060]" />
              <span>Memories Kept</span>
            </div>
            <div className="text-xl font-extrabold text-[#18231F] tabular-nums">
              {keptCount}
            </div>
            <div className="text-[10px] text-[#737B75]">Preserved forever</div>
          </div>

          {/* Cleaned */}
          <div className="p-3.5 rounded-2xl bg-red-50/60 border border-red-100">
            <div className="flex items-center gap-1.5 text-xs text-[#C86462] mb-1 font-semibold">
              <Trash2 className="w-3.5 h-3.5" />
              <span>Cleaned</span>
            </div>
            <div className="text-xl font-extrabold text-[#C86462] tabular-nums">
              {deletedCount}
            </div>
            <div className="text-[10px] text-[#C86462]/80">Removed safely</div>
          </div>
        </div>

        {/* Gallery Health & Streak Combined Row */}
        <div className="grid grid-cols-2 gap-3 text-left">
          <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100">
            <div className="flex items-center gap-1 text-[11px] font-semibold text-[#2D8060]">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Gallery Health</span>
            </div>
            <div className="text-base font-extrabold text-[#244D3F] mt-0.5 tabular-nums">
              {healthScore}% Clean
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-100">
            <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-800">
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>Cleaning Streak</span>
            </div>
            <div className="text-base font-extrabold text-amber-950 mt-0.5 tabular-nums">
              {dailyStreak} Days
            </div>
          </div>
        </div>
      </motion.div>

      {/* Smart Next Recommendation Card */}
      {nextRecommended && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="w-full mb-5 p-3.5 rounded-2xl bg-white border border-[#244D3F]/20 shadow-xs flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-xl overflow-hidden border border-[#E6E9E2] bg-slate-100 shrink-0">
              <img
                src={nextRecommended.sampleThumbnail}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-[#2D8060] tracking-wider block">
                Recommended Next
              </span>
              <h4 className="text-xs font-bold text-[#18231F] truncate">
                {nextRecommended.monthName}
              </h4>
              <p className="text-[11px] text-[#737B75] tabular-nums">
                {nextRecommended.totalCount} items to review
              </p>
            </div>
          </div>

          <button
            onClick={onCleanAnother}
            className="px-3 py-1.5 bg-[#244D3F] text-white font-bold text-xs rounded-xl shadow-xs hover:bg-[#18231F] transition-all cursor-pointer shrink-0"
          >
            Start
          </button>
        </motion.div>
      )}

      {/* Action Buttons */}
      <div className="w-full space-y-2.5">
        <button
          onClick={onCleanAnother}
          className="w-full min-h-[48px] py-3 px-5 bg-[#244D3F] hover:bg-[#18231F] text-white font-bold text-sm rounded-2xl shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Continue to Next Collection</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          onClick={onGoHome}
          className="w-full min-h-[44px] py-2.5 px-5 bg-white border border-[#E6E9E2] hover:bg-[#F8F7F3] text-[#18231F] font-semibold text-xs rounded-2xl active:scale-95 transition-all cursor-pointer"
        >
          Return to Library
        </button>
      </div>
    </div>
  );
};
