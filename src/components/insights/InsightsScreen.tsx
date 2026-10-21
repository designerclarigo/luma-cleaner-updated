import React from 'react';
import { motion } from 'motion/react';
import { mediaService, formatBytes } from '../../services/mediaService';
import {
  BarChart3,
  Flame,
  HardDrive,
  Trash2,
  Heart,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  TrendingUp,
  PieChart,
  ShieldCheck,
  Layers,
  Camera,
  Film,
} from 'lucide-react';

export const InsightsScreen: React.FC = () => {
  const stats = mediaService.getStats();
  const storage = mediaService.getStorageBreakdown();
  const healthScore = mediaService.getGalleryHealthScore();

  const totalDecisions = stats.totalKept + stats.totalDeleted;
  const keepRatio =
    totalDecisions > 0 ? Math.round((stats.totalKept / totalDecisions) * 100) : 100;

  return (
    <div className="space-y-6 px-4 pb-28 pt-2 select-none">
      {/* Title */}
      <div>
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#2D8060] uppercase tracking-wider mb-0.5">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Gallery Health & Analytics</span>
        </div>
        <h1 className="text-2xl font-black tracking-tight text-[#18231F]">
          Cleaning Insights
        </h1>
        <p className="text-xs text-[#737B75] mt-0.5">
          Real metrics generated from your verified device decisions.
        </p>
      </div>

      {/* Hero Streak & Health Score Combined Card */}
      <div className="rounded-3xl bg-linear-to-br from-[#1E3B31] via-[#244D3F] to-[#18231F] text-white p-5 shadow-lg relative overflow-hidden border border-[#2D8060]/30">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#DCE8B0]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400 fill-amber-400 animate-pulse" />
            <span className="text-xs font-bold tracking-wider uppercase text-[#DCE8B0]">
              Daily Cleaning Streak
            </span>
          </div>
          <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-white/15 text-white">
            Active
          </span>
        </div>

        <div className="mt-4 flex items-baseline justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-[#DCE8B0] tabular-nums tracking-tight">
                {stats.dailyStreak}
              </span>
              <span className="text-base font-bold text-white/90">
                {stats.dailyStreak === 1 ? 'day in a row' : 'days streak'}
              </span>
            </div>
            <p className="text-[11px] text-white/70 mt-1 max-w-xs leading-relaxed">
              Tidy at least one photo batch daily to maintain your gallery streak.
            </p>
          </div>

          {/* Health Gauge Box */}
          <div className="text-right p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
            <span className="text-[10px] uppercase font-bold text-white/70 block">
              Health Index
            </span>
            <span className="text-2xl font-black text-[#DCE8B0] tabular-nums">
              {healthScore}%
            </span>
          </div>
        </div>
      </div>

      {/* Storage Breakdown Visualizer Card */}
      <div className="p-4 bg-white rounded-3xl border border-[#E6E9E2] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-[#244D3F]" />
            <h3 className="text-sm font-extrabold text-[#18231F]">
              Storage Distribution
            </h3>
          </div>
          <span className="text-xs font-mono tabular-nums text-[#737B75]">
            {formatBytes(storage.totalMediaBytes)} media
          </span>
        </div>

        {/* Visual progress bar */}
        <div className="h-3.5 w-full bg-[#E6E9E2] rounded-full overflow-hidden flex p-0.5 gap-0.5">
          <div
            style={{
              width: `${Math.max(
                (storage.totalPhotosSize / (storage.totalMediaBytes || 1)) * 100,
                15
              )}%`,
            }}
            className="bg-[#2D8060] h-full rounded-l-full"
            title="Photos"
          />
          <div
            style={{
              width: `${Math.max(
                (storage.totalVideosSize / (storage.totalMediaBytes || 1)) * 100,
                15
              )}%`,
            }}
            className="bg-[#DCE8B0] h-full"
            title="Videos"
          />
          <div
            style={{
              width: `${Math.max(
                (storage.totalScreenshotsSize / (storage.totalMediaBytes || 1)) * 100,
                10
              )}%`,
            }}
            className="bg-[#C86462] h-full"
            title="Screenshots"
          />
          <div className="bg-[#E6E9E2] h-full flex-1 rounded-r-full" />
        </div>

        {/* Breakdown Legend items */}
        <div className="grid grid-cols-3 gap-2 pt-1 text-xs">
          <div className="p-2.5 rounded-2xl bg-[#F8F7F3] border border-[#E6E9E2]/60">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#18231F]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2D8060]" />
              <span>Photos</span>
            </div>
            <div className="text-xs font-mono tabular-nums text-[#737B75] mt-1">
              {formatBytes(storage.totalPhotosSize)}
            </div>
            <div className="text-[10px] text-[#737B75]">{storage.photoCount} items</div>
          </div>

          <div className="p-2.5 rounded-2xl bg-[#F8F7F3] border border-[#E6E9E2]/60">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#18231F]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#DCE8B0]" />
              <span>Videos</span>
            </div>
            <div className="text-xs font-mono tabular-nums text-[#737B75] mt-1">
              {formatBytes(storage.totalVideosSize)}
            </div>
            <div className="text-[10px] text-[#737B75]">{storage.videoCount} clips</div>
          </div>

          <div className="p-2.5 rounded-2xl bg-[#F8F7F3] border border-[#E6E9E2]/60">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#18231F]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C86462]" />
              <span>Screenshots</span>
            </div>
            <div className="text-xs font-mono tabular-nums text-[#737B75] mt-1">
              {formatBytes(storage.totalScreenshotsSize)}
            </div>
            <div className="text-[10px] text-[#737B75]">{storage.screenshotCount} shots</div>
          </div>
        </div>
      </div>

      {/* Grid of Verified Core Metrics */}
      <div className="grid grid-cols-2 gap-3">
        {/* Storage Reclaimed */}
        <div className="p-4 bg-white rounded-3xl border border-[#E6E9E2] shadow-xs">
          <div className="w-9 h-9 rounded-2xl bg-[#DCE8B0]/50 flex items-center justify-center text-[#244D3F] mb-2">
            <HardDrive className="w-4 h-4" />
          </div>
          <div className="text-[11px] font-bold text-[#737B75]">Total Reclaimed</div>
          <div className="text-xl font-black text-[#18231F] tabular-nums mt-0.5">
            {formatBytes(stats.bytesReclaimed)}
          </div>
          <div className="text-[10px] text-[#2D8060] font-bold mt-1">Confirmed local space</div>
        </div>

        {/* Total Reviewed */}
        <div className="p-4 bg-white rounded-3xl border border-[#E6E9E2] shadow-xs">
          <div className="w-9 h-9 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-700 mb-2">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div className="text-[11px] font-bold text-[#737B75]">Decisions Made</div>
          <div className="text-xl font-black text-[#18231F] tabular-nums mt-0.5">
            {stats.totalReviewed}
          </div>
          <div className="text-[10px] text-[#737B75] mt-1">Total items reviewed</div>
        </div>

        {/* Kept Photos */}
        <div className="p-4 bg-white rounded-3xl border border-[#E6E9E2] shadow-xs">
          <div className="w-9 h-9 rounded-2xl bg-emerald-50 flex items-center justify-center text-[#2D8060] mb-2">
            <Heart className="w-4 h-4 fill-[#2D8060]" />
          </div>
          <div className="text-[11px] font-bold text-[#737B75]">Memories Preserved</div>
          <div className="text-xl font-black text-[#18231F] tabular-nums mt-0.5">
            {stats.totalKept}
          </div>
          <div className="text-[10px] text-[#2D8060] font-bold mt-1">
            {keepRatio}% keep ratio
          </div>
        </div>

        {/* Deleted Photos */}
        <div className="p-4 bg-white rounded-3xl border border-[#E6E9E2] shadow-xs">
          <div className="w-9 h-9 rounded-2xl bg-red-50 flex items-center justify-center text-[#C86462] mb-2">
            <Trash2 className="w-4 h-4" />
          </div>
          <div className="text-[11px] font-bold text-[#737B75]">Clutter Removed</div>
          <div className="text-xl font-black text-[#C86462] tabular-nums mt-0.5">
            {stats.totalDeleted}
          </div>
          <div className="text-[10px] text-[#C86462] font-bold mt-1">Confirmed deleted</div>
        </div>
      </div>

      {/* History Activity Log */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#737B75]">
            Cleanup Activity Log
          </h2>
          <span className="text-xs font-semibold text-[#244D3F]">
            {stats.cleanupLogs.length} Sessions
          </span>
        </div>

        {stats.cleanupLogs.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-3xl border border-[#E6E9E2] text-[#737B75]">
            <Clock className="w-8 h-8 mx-auto mb-2 text-[#737B75]/60" />
            <p className="text-xs font-bold text-[#18231F]">No sessions completed yet</p>
            <p className="text-[11px] mt-0.5">Start a session on the Clean tab to see your log.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {stats.cleanupLogs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 bg-white border border-[#E6E9E2] rounded-2xl shadow-xs flex items-center justify-between"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#2D8060] shrink-0">
                    <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-[#18231F] truncate">
                      {log.sessionTitle}
                    </h4>
                    <p className="text-[11px] text-[#737B75] mt-0.5">
                      {log.date} · {log.keptCount} kept, {log.deletedCount} removed
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0 ml-3">
                  <span className="text-xs font-bold text-[#2D8060] font-mono tabular-nums">
                    +{formatBytes(log.bytesReclaimed)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
