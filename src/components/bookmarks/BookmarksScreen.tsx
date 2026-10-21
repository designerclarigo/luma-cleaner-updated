import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MediaItem } from '../../types/media';
import { mediaService, formatBytes, formatDate } from '../../services/mediaService';
import {
  Bookmark,
  Star,
  X,
  Play,
  Maximize2,
  Calendar,
  Sparkles,
  Heart,
  HardDrive,
  Film,
  Camera,
} from 'lucide-react';

interface BookmarksScreenProps {
  onRefresh: () => void;
  onStartCleaning?: () => void;
}

export const BookmarksScreen: React.FC<BookmarksScreenProps> = ({
  onRefresh,
  onStartCleaning,
}) => {
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'photo' | 'video'>('all');
  const bookmarkedItems = mediaService.getBookmarks();

  const handleRemoveBookmark = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    mediaService.toggleBookmark(id);
    if (selectedItem?.id === id) {
      setSelectedItem(null);
    }
    onRefresh();
  };

  const filteredItems = bookmarkedItems.filter((item) => {
    if (filterType === 'all') return true;
    return item.mediaType === filterType;
  });

  const totalBookmarkedBytes = bookmarkedItems.reduce((sum, it) => sum + it.fileSize, 0);

  return (
    <div className="space-y-5 px-4 pb-28 pt-2 select-none">
      {/* Screen Title & Micro Stats Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 uppercase tracking-wider mb-0.5">
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>Cherished Memories</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-[#18231F]">
            Bookmarks
          </h1>
          <p className="text-xs text-[#737B75] mt-0.5">
            Protected from deletion and kept safe forever.
          </p>
        </div>

        {bookmarkedItems.length > 0 && (
          <div className="text-right">
            <span className="text-xs font-extrabold text-[#18231F] tabular-nums block">
              {bookmarkedItems.length} {bookmarkedItems.length === 1 ? 'item' : 'items'}
            </span>
            <span className="text-[10px] text-[#737B75] font-mono tabular-nums">
              {formatBytes(totalBookmarkedBytes)}
            </span>
          </div>
        )}
      </div>

      {/* Filter Chips Bar */}
      {bookmarkedItems.length > 0 && (
        <div className="flex items-center gap-1.5 text-xs">
          {(['all', 'photo', 'video'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-xl font-bold capitalize transition-all cursor-pointer ${
                filterType === type
                  ? 'bg-[#244D3F] text-white shadow-2xs'
                  : 'bg-white border border-[#E6E9E2] text-[#737B75] hover:text-[#18231F]'
              }`}
            >
              {type === 'all'
                ? `All (${bookmarkedItems.length})`
                : type === 'photo'
                ? `Photos (${bookmarkedItems.filter((i) => i.mediaType === 'photo').length})`
                : `Videos (${bookmarkedItems.filter((i) => i.mediaType === 'video').length})`}
            </button>
          ))}
        </div>
      )}

      {/* Grid or Empty State */}
      {bookmarkedItems.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-[#E6E9E2] p-8 shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-amber-50 border border-amber-200/60 text-amber-500 flex items-center justify-center mx-auto shadow-2xs">
            <Bookmark className="w-8 h-8 fill-amber-500/20" />
          </div>

          <div>
            <h3 className="text-base font-extrabold text-[#18231F]">
              No bookmarked memories yet
            </h3>
            <p className="text-xs text-[#737B75] mt-1 max-w-xs mx-auto leading-relaxed">
              When reviewing photos on the Clean tab, tap the star icon or press <kbd className="font-mono bg-[#EFECE6] px-1 rounded text-[11px]">B</kbd> to save your most precious moments here.
            </p>
          </div>

          {onStartCleaning && (
            <button
              onClick={onStartCleaning}
              className="px-5 py-2.5 bg-[#244D3F] hover:bg-[#18231F] text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
            >
              Start Cleaning Gallery
            </button>
          )}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="py-12 text-center text-[#737B75] bg-white rounded-3xl border border-[#E6E9E2]">
          <p className="text-xs font-semibold">No {filterType}s found in bookmarks.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {filteredItems.map((item) => (
            <motion.div
              key={item.id}
              layout
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedItem(item)}
              className="group relative aspect-square rounded-3xl overflow-hidden bg-slate-100 border border-[#E6E9E2] cursor-pointer shadow-xs hover:border-[#244D3F]/40 transition-all select-none"
            >
              <img
                src={item.thumbnailUri || item.uri}
                alt={item.filename}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-300"
              />

              {/* Bookmark Star Button Badge */}
              <button
                onClick={(e) => handleRemoveBookmark(item.id, e)}
                className="absolute top-2 right-2 p-1.5 rounded-xl bg-amber-500 text-white shadow-xs hover:bg-amber-600 active:scale-90 transition-transform cursor-pointer"
                title="Remove from bookmarks"
                aria-label="Remove bookmark"
              >
                <Star className="w-3.5 h-3.5 fill-white" />
              </button>

              {/* Video Indicator Pill */}
              {item.mediaType === 'video' && (
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1">
                  <Play className="w-2.5 h-2.5 fill-white" />
                  <span>{item.duration ? `${item.duration}s` : 'Video'}</span>
                </div>
              )}

              {/* Bottom Scrim with Name & Size */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2.5 text-white">
                <p className="text-[11px] font-bold truncate leading-tight">
                  {item.filename}
                </p>
                <div className="flex items-center justify-between text-[10px] text-white/80 mt-0.5 font-mono tabular-nums">
                  <span>{formatBytes(item.fileSize)}</span>
                  <span className="text-[9px] font-sans text-amber-300">Protected</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* High-Resolution Media Viewer Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          >
            <div className="relative max-w-lg w-full bg-white rounded-3xl overflow-hidden shadow-2xl border border-[#E6E9E2] flex flex-col">
              {/* Modal Top Bar */}
              <div className="p-3.5 border-b border-[#E6E9E2] flex items-center justify-between bg-[#F8F7F3]">
                <div className="flex items-center gap-2 truncate pr-2">
                  <div className="p-1 rounded-lg bg-amber-500 text-white">
                    <Star className="w-3.5 h-3.5 fill-white" />
                  </div>
                  <span className="text-xs font-bold text-[#18231F] truncate">
                    {selectedItem.filename}
                  </span>
                </div>

                <button
                  onClick={() => setSelectedItem(null)}
                  className="w-8 h-8 rounded-full bg-white border border-[#E6E9E2] flex items-center justify-center text-[#737B75] hover:text-[#18231F] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Media Container */}
              <div className="relative aspect-4/3 bg-black flex items-center justify-center overflow-hidden">
                {selectedItem.mediaType === 'video' ? (
                  <video
                    src={selectedItem.uri}
                    controls
                    playsInline
                    autoPlay
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <img
                    src={selectedItem.uri}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain"
                  />
                )}
              </div>

              {/* Bottom Metadata & Actions */}
              <div className="p-4 bg-white flex items-center justify-between">
                <div className="text-xs text-[#737B75] space-y-0.5">
                  <div className="font-medium text-[#18231F]">
                    {formatDate(selectedItem.creationTime)}
                  </div>
                  <div className="tabular-nums font-mono text-[11px]">
                    {formatBytes(selectedItem.fileSize)} · {selectedItem.width}×{selectedItem.height} px
                  </div>
                </div>

                <button
                  onClick={() => handleRemoveBookmark(selectedItem.id)}
                  className="px-3.5 py-2 rounded-xl bg-amber-50 text-amber-800 text-xs font-bold hover:bg-amber-100 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Star className="w-3.5 h-3.5 fill-amber-700" />
                  <span>Remove Bookmark</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
