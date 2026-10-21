import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CleanupSession, MediaItem } from '../../types/media';
import { mediaService, formatBytes, formatDate } from '../../services/mediaService';
import {
  X,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Maximize2,
  CheckSquare,
  Square,
  Sparkles,
  Info,
  Calendar,
  Film,
  Camera,
} from 'lucide-react';

interface ReviewSheetProps {
  session: CleanupSession;
  onClose: () => void;
  onConfirmDeletion: (finalIdsToDelete: string[]) => void;
  onKeepAll: () => void;
}

export const ReviewSheet: React.FC<ReviewSheetProps> = ({
  session,
  onClose,
  onConfirmDeletion,
  onKeepAll,
}) => {
  // Extract all items currently marked for deletion
  const initialDeleteIds = Object.entries(session.decisions)
    .filter(([_, d]) => d === 'delete')
    .map(([id]) => id);

  const [selectedDeleteIds, setSelectedDeleteIds] = useState<Set<string>>(
    new Set(initialDeleteIds)
  );

  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);

  const allMedia = mediaService.getAllMedia();
  const markedItems: MediaItem[] = initialDeleteIds
    .map((id) => allMedia.find((m) => m.id === id))
    .filter((m): m is MediaItem => !!m);

  // Toggle item from deletion
  const handleToggleItem = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedDeleteIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id); // restored / kept
      } else {
        next.add(id); // re-marked for deletion
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedDeleteIds.size === markedItems.length) {
      setSelectedDeleteIds(new Set());
    } else {
      setSelectedDeleteIds(new Set(markedItems.map((m) => m.id)));
    }
  };

  // Calculate size to reclaim
  const totalReclaimedBytes = markedItems
    .filter((item) => selectedDeleteIds.has(item.id))
    .reduce((sum, item) => sum + item.fileSize, 0);

  const deleteCount = selectedDeleteIds.size;
  const isAllSelected = markedItems.length > 0 && selectedDeleteIds.size === markedItems.length;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end sm:justify-center sm:items-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-[#E6E9E2]">
        {/* Top Header */}
        <div className="p-4 border-b border-[#E6E9E2] flex items-center justify-between shrink-0 bg-[#F8F7F3]">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-red-100 text-[#C86462]">
                <Trash2 className="w-4 h-4 stroke-[2.5]" />
              </span>
              <h3 className="text-base font-extrabold text-[#18231F] tracking-tight">
                Review Marked Deletions
              </h3>
            </div>
            <p className="text-xs text-[#737B75] mt-0.5">
              Tap any photo to deselect and preserve it.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-[#E6E9E2] flex items-center justify-center text-[#737B75] hover:text-[#18231F] transition-all cursor-pointer"
            aria-label="Close review"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Reclaim Bar & Select All Action */}
        <div className="px-4 py-3 bg-white border-b border-[#E6E9E2] flex items-center justify-between shrink-0">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-black text-[#C86462] tabular-nums">
              {formatBytes(totalReclaimedBytes)}
            </span>
            <span className="text-xs text-[#737B75]">
              to reclaim ({deleteCount} of {markedItems.length})
            </span>
          </div>

          {markedItems.length > 0 && (
            <button
              onClick={handleSelectAll}
              className="text-xs font-bold text-[#244D3F] hover:text-[#18231F] flex items-center gap-1.5 cursor-pointer py-1 px-2 rounded-lg hover:bg-[#F8F7F3]"
            >
              {isAllSelected ? (
                <>
                  <CheckSquare className="w-4 h-4 text-[#2D8060]" />
                  <span>Deselect All</span>
                </>
              ) : (
                <>
                  <Square className="w-4 h-4 text-[#737B75]" />
                  <span>Select All</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Safety Notice Warning */}
        <div className="px-4 py-2 bg-amber-500/10 border-b border-amber-500/20 flex items-start gap-2.5 text-xs text-amber-950 shrink-0">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-tight text-amber-900">
            <strong>Safety Guaranteed:</strong> Swiping never deletes files automatically. Marked items require your confirmation and will trigger the native device safety prompt.
          </p>
        </div>

        {/* Media Grid */}
        <div className="flex-1 overflow-y-auto p-4 bg-[#F8F7F3]">
          {markedItems.length === 0 ? (
            <div className="py-16 text-center text-[#737B75]">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#2D8060] flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
              </div>
              <p className="text-sm font-bold text-[#18231F]">No photos marked for deletion</p>
              <p className="text-xs text-[#737B75] mt-1">Every photo in this collection will be kept.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2.5">
              {markedItems.map((item) => {
                const isSelectedForDelete = selectedDeleteIds.has(item.id);

                return (
                  <motion.div
                    key={item.id}
                    layout
                    whileTap={{ scale: 0.96 }}
                    onClick={() => handleToggleItem(item.id)}
                    className={`group relative aspect-square rounded-2xl overflow-hidden cursor-pointer transition-all select-none border-2 ${
                      isSelectedForDelete
                        ? 'border-[#C86462] ring-2 ring-[#C86462]/30 shadow-sm opacity-95'
                        : 'border-[#2D8060] ring-2 ring-[#2D8060]/30 shadow-xs opacity-65'
                    }`}
                  >
                    <img
                      src={item.thumbnailUri || item.uri}
                      alt={item.filename}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />

                    {/* Status Badge in Top Right */}
                    <div
                      className={`absolute top-1.5 right-1.5 p-1 rounded-xl text-white shadow-xs transition-colors ${
                        isSelectedForDelete ? 'bg-[#C86462]' : 'bg-[#2D8060]'
                      }`}
                    >
                      {isSelectedForDelete ? (
                        <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                      )}
                    </div>

                    {/* Quick Preview Magnifier Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewItem(item);
                      }}
                      className="absolute top-1.5 left-1.5 w-6 h-6 rounded-lg bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                      title="Inspect photo"
                    >
                      <Maximize2 className="w-3 h-3" />
                    </button>

                    {/* Bottom Scrim with File Size */}
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-1.5 text-white flex items-center justify-between text-[10px]">
                      <span className="font-mono tabular-nums text-[10px]">
                        {formatBytes(item.fileSize)}
                      </span>
                      <span
                        className={`text-[9px] font-bold uppercase tracking-tight px-1.5 py-0.2 rounded-md ${
                          isSelectedForDelete ? 'bg-[#C86462]' : 'bg-[#2D8060]'
                        }`}
                      >
                        {isSelectedForDelete ? 'Delete' : 'Keep'}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom Actions Bar */}
        <div className="p-4 bg-white border-t border-[#E6E9E2] space-y-2.5 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={onKeepAll}
              className="flex-1 py-3 px-4 bg-[#F8F7F3] hover:bg-[#E6E9E2] text-[#18231F] font-bold text-xs rounded-2xl transition-colors cursor-pointer"
            >
              Keep Everything
            </button>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => onConfirmDeletion(Array.from(selectedDeleteIds))}
              disabled={deleteCount === 0}
              className={`flex-2 py-3 px-4 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer ${
                deleteCount > 0
                  ? 'bg-[#C86462] hover:bg-red-700 text-white'
                  : 'bg-[#E6E9E2] text-[#737B75] cursor-not-allowed opacity-60'
              }`}
            >
              <Trash2 className="w-4 h-4 stroke-[2.4]" />
              <span>
                Delete {deleteCount} {deleteCount === 1 ? 'Item' : 'Items'} ({formatBytes(totalReclaimedBytes)})
              </span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Full-Screen Media Inspection Modal */}
      <AnimatePresence>
        {previewItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex flex-col justify-between p-4"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between text-white pb-3 border-b border-white/15">
              <div className="min-w-0 pr-4">
                <h4 className="text-sm font-bold truncate">{previewItem.filename}</h4>
                <p className="text-[11px] text-white/70">
                  {formatDate(previewItem.creationTime)} · {formatBytes(previewItem.fileSize)}
                </p>
              </div>

              <button
                onClick={() => setPreviewItem(null)}
                className="w-9 h-9 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Media Canvas */}
            <div className="flex-1 flex items-center justify-center py-4 overflow-hidden">
              {previewItem.mediaType === 'video' ? (
                <video
                  src={previewItem.uri}
                  controls
                  playsInline
                  autoPlay
                  className="max-w-full max-h-[70vh] object-contain rounded-2xl"
                />
              ) : (
                <img
                  src={previewItem.uri}
                  alt={previewItem.filename}
                  className="max-w-full max-h-[70vh] object-contain rounded-2xl shadow-2xl"
                />
              )}
            </div>

            {/* Modal Bottom Details & Action */}
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 text-white flex items-center justify-between">
              <div className="text-xs space-y-0.5">
                <div className="font-mono text-white/80">
                  {previewItem.width} × {previewItem.height} px
                </div>
                <div className="text-white/60 text-[11px]">
                  Album: {previewItem.albumName || 'Camera'}
                </div>
              </div>

              <button
                onClick={() => {
                  handleToggleItem(previewItem.id);
                  setPreviewItem(null);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedDeleteIds.has(previewItem.id)
                    ? 'bg-[#2D8060] text-white hover:bg-emerald-700'
                    : 'bg-[#C86462] text-white hover:bg-red-700'
                }`}
              >
                {selectedDeleteIds.has(previewItem.id) ? 'Keep this Photo' : 'Mark for Deletion'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
