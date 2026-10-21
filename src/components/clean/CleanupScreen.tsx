import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CleanupSession,
  MediaItem,
  DecisionType,
} from '../../types/media';
import { mediaService, formatBytes, formatDate } from '../../services/mediaService';
import {
  ArrowLeft,
  RotateCcw,
  Star,
  Check,
  Trash2,
  Info,
  Play,
  Pause,
  Volume2,
  VolumeX,
  X,
  Sparkles,
  HelpCircle,
  Eye,
  ChevronRight,
} from 'lucide-react';

interface CleanupScreenProps {
  session: CleanupSession;
  onUpdateSession: (updated: CleanupSession) => void;
  onFinishSession: (session: CleanupSession) => void;
  onBack: () => void;
  onOpenReview: (session: CleanupSession) => void;
  reducedMotion?: boolean;
}

export const CleanupScreen: React.FC<CleanupScreenProps> = ({
  session,
  onUpdateSession,
  onFinishSession,
  onBack,
  onOpenReview,
  reducedMotion = false,
}) => {
  // Drag gesture states
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartY, setDragStartY] = useState(0);
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null);
  const [isReturningFromUndo, setIsReturningFromUndo] = useState(false);

  // Lock to prevent accidental double actions or overlapping animations
  const isAnimatingRef = useRef(false);

  // First-time swipe tutorial state
  const [showTutorial, setShowTutorial] = useState<boolean>(() => {
    try {
      return localStorage.getItem('luma_seen_swipe_tutorial') !== 'true';
    } catch {
      return true;
    }
  });

  // Video playback states
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Media info sheet state
  const [showInfoSheet, setShowInfoSheet] = useState(false);

  // Current media stack (Top card + 2 subtly layered cards behind it)
  const currentIndex = session.currentIndex;
  const currentMediaId = session.mediaIds[currentIndex];
  const nextMediaId = session.mediaIds[currentIndex + 1];
  const afterNextMediaId = session.mediaIds[currentIndex + 2];

  const currentMedia: MediaItem | undefined = currentMediaId
    ? mediaService.getMediaById(currentMediaId)
    : undefined;

  const nextMedia: MediaItem | undefined = nextMediaId
    ? mediaService.getMediaById(nextMediaId)
    : undefined;

  const afterNextMedia: MediaItem | undefined = afterNextMediaId
    ? mediaService.getMediaById(afterNextMediaId)
    : undefined;

  const totalCount = session.mediaIds.length;
  const pendingDeletionsCount = Object.values(session.decisions).filter(
    (d) => d === 'delete'
  ).length;

  const dismissTutorial = () => {
    setShowTutorial(false);
    try {
      localStorage.setItem('luma_seen_swipe_tutorial', 'true');
    } catch {
      // ignore
    }
  };

  // Internal commit of a decision to session state & persistent storage
  const commitDecision = useCallback(
    (decision: DecisionType) => {
      if (!currentMediaId) return;

      const newDecisions = { ...session.decisions, [currentMediaId]: decision };
      const newHistory = [...session.history, currentMediaId];
      const nextIndex = currentIndex + 1;

      const updatedSession: CleanupSession = {
        ...session,
        decisions: newDecisions,
        history: newHistory,
        currentIndex: nextIndex,
        lastActiveTime: Date.now(),
      };

      setDragOffset({ x: 0, y: 0 });
      setIsDragging(false);
      setExitDirection(null);
      isAnimatingRef.current = false;

      if (nextIndex >= totalCount) {
        updatedSession.isCompleted = true;
        onUpdateSession(updatedSession);
        onFinishSession(updatedSession);
      } else {
        onUpdateSession(updatedSession);
      }
    },
    [currentMediaId, session, currentIndex, totalCount, onUpdateSession, onFinishSession]
  );

  // Trigger decision with Tinder-style fly-off momentum and double-tap prevention
  const triggerDecision = useCallback(
    (decision: DecisionType) => {
      if (!currentMediaId || isAnimatingRef.current) return;
      isAnimatingRef.current = true;

      // Dismiss tutorial if still active
      if (showTutorial) {
        dismissTutorial();
      }

      // Haptic feedback
      if ('vibrate' in navigator) {
        try {
          navigator.vibrate?.(16);
        } catch {
          // ignore
        }
      }

      if (reducedMotion) {
        commitDecision(decision);
        return;
      }

      setExitDirection(decision === 'keep' ? 'right' : 'left');
      setTimeout(() => {
        commitDecision(decision);
      }, 210);
    },
    [currentMediaId, reducedMotion, commitDecision, showTutorial]
  );

  // Handle Undo: brings previous card back and restores previous state
  const handleUndo = useCallback(() => {
    if (session.history.length === 0 || currentIndex === 0 || isAnimatingRef.current) return;

    isAnimatingRef.current = true;
    const newHistory = [...session.history];
    const lastId = newHistory.pop();
    if (!lastId) {
      isAnimatingRef.current = false;
      return;
    }

    const newDecisions = { ...session.decisions };
    delete newDecisions[lastId];

    const prevIndex = currentIndex - 1;
    const updatedSession: CleanupSession = {
      ...session,
      decisions: newDecisions,
      history: newHistory,
      currentIndex: prevIndex,
      isCompleted: false,
      lastActiveTime: Date.now(),
    };

    // Subtle reverse entrance feedback
    setIsReturningFromUndo(true);
    setDragOffset({ x: 0, y: 0 });
    onUpdateSession(updatedSession);

    setTimeout(() => {
      setIsReturningFromUndo(false);
      isAnimatingRef.current = false;
    }, 280);
  }, [session, currentIndex, onUpdateSession]);

  // Handle Bookmark Toggle
  const handleToggleBookmark = useCallback(() => {
    if (!currentMedia) return;
    mediaService.toggleBookmark(currentMedia.id);
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate?.(12);
      } catch {
        // ignore
      }
    }
    onUpdateSession({ ...session, lastActiveTime: Date.now() });
  }, [currentMedia, session, onUpdateSession]);

  // Keyboard navigation shortcuts for rapid cleaning
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showInfoSheet) return;
      if (e.key === 'ArrowRight') {
        triggerDecision('keep');
      } else if (e.key === 'ArrowLeft') {
        triggerDecision('delete');
      } else if (e.key === 'z' || e.key === 'Z') {
        handleUndo();
      } else if (e.key === 'ArrowUp' || e.key === 'b' || e.key === 'B') {
        handleToggleBookmark();
      } else if (e.key === ' ') {
        if (currentMedia?.mediaType === 'video' && videoRef.current) {
          e.preventDefault();
          if (videoRef.current.paused) {
            videoRef.current.play();
            setIsPlaying(true);
          } else {
            videoRef.current.pause();
            setIsPlaying(false);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [triggerDecision, handleUndo, handleToggleBookmark, showInfoSheet, currentMedia]);

  // Drag / Pointer touch gesture handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    if (isAnimatingRef.current) return;
    setIsDragging(true);
    setDragStartX(e.clientX);
    setDragStartY(e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || isAnimatingRef.current) return;
    const deltaX = e.clientX - dragStartX;
    const deltaY = (e.clientY - dragStartY) * 0.35; // dampened vertical motion
    setDragOffset({ x: deltaX, y: deltaY });
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const SWIPE_THRESHOLD = 80; // px threshold for decisive swipe
    if (dragOffset.x > SWIPE_THRESHOLD) {
      triggerDecision('keep');
    } else if (dragOffset.x < -SWIPE_THRESHOLD) {
      triggerDecision('delete');
    } else {
      // Natural spring snap back to center
      setDragOffset({ x: 0, y: 0 });
    }
  };

  // Drag physics calculations
  const dragFraction = Math.min(Math.abs(dragOffset.x) / 300, 1);
  const rotation = reducedMotion ? 0 : Math.max(Math.min(dragOffset.x * 0.08, 14), -14); // max ±14 deg
  const keepOpacity = Math.min(Math.max((dragOffset.x - 15) / 65, 0), 1);
  const deleteOpacity = Math.min(Math.max((-dragOffset.x - 15) / 65, 0), 1);

  if (!currentMedia) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center select-none">
        <div className="w-16 h-16 rounded-3xl bg-[#DCE8B0]/60 flex items-center justify-center mb-4 text-[#244D3F] shadow-sm">
          <Sparkles className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-[#18231F] tracking-tight">Collection finished!</h2>
        <p className="text-xs text-[#737B75] mt-1.5 mb-6 max-w-xs leading-relaxed">
          You have reviewed every photo in this collection. Proceed to check your selection before applying changes.
        </p>
        <button
          onClick={() => onFinishSession(session)}
          className="min-h-[46px] px-8 py-3 bg-[#244D3F] hover:bg-[#18231F] text-white font-bold text-sm rounded-2xl shadow-sm active:scale-95 transition-all cursor-pointer"
        >
          Proceed to Review
        </button>
      </div>
    );
  }

  const isCurrentBookmarked = mediaService.getBookmarks().some((b) => b.id === currentMedia.id);

  return (
    <div className="relative flex flex-col h-[calc(100vh-70px)] max-h-[860px] select-none touch-none overflow-hidden pb-3">
      {/* Top Session Bar with Progress, Review & Tutorial Toggle */}
      <div className="flex items-center justify-between px-4 py-2 shrink-0">
        <button
          onClick={onBack}
          className="min-h-[40px] min-w-[40px] flex items-center justify-center text-[#737B75] hover:text-[#18231F] rounded-xl hover:bg-white active:scale-95 transition-all cursor-pointer"
          aria-label="Back to library"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Center Progress Indicator */}
        <div className="flex flex-col items-center">
          <span className="text-xs font-bold text-[#18231F] tabular-nums tracking-tight">
            {currentIndex + 1} <span className="text-[#737B75] font-normal">of</span> {totalCount}
          </span>
          <div className="w-28 bg-[#E6E9E2] h-1.5 rounded-full overflow-hidden mt-1">
            <div
              className="bg-[#244D3F] h-full rounded-full transition-all duration-200"
              style={{ width: `${Math.round(((currentIndex + 1) / totalCount) * 100)}%` }}
            />
          </div>
        </div>

        {/* Right Action Group: Review & Tutorial Hint */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowTutorial(!showTutorial)}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-[#737B75] hover:text-[#18231F] hover:bg-white transition-colors cursor-pointer"
            title="How to swipe"
            aria-label="Swipe guide"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <button
            onClick={() => onOpenReview(session)}
            disabled={pendingDeletionsCount === 0}
            className={`min-h-[34px] px-3 py-1 flex items-center gap-1.5 text-xs font-bold rounded-xl border transition-all ${
              pendingDeletionsCount > 0
                ? 'text-[#C86462] bg-red-50/90 border-red-200 hover:bg-red-100 active:scale-95 cursor-pointer shadow-2xs'
                : 'text-[#737B75] bg-transparent border-transparent opacity-40 cursor-not-allowed'
            }`}
            title="Review photos marked for deletion"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="tabular-nums">Review ({pendingDeletionsCount})</span>
          </button>
        </div>
      </div>

      {/* Brief First-Use Swipe Tutorial Floating Banner */}
      <AnimatePresence>
        {showTutorial && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.96 }}
            className="mx-4 mb-2 p-3 bg-white/95 backdrop-blur-md rounded-2xl border border-[#244D3F]/20 shadow-md flex items-center justify-between text-xs z-30 shrink-0"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#DCE8B0]/60 flex items-center justify-center text-[#244D3F] shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="text-[11px] leading-tight">
                <p className="font-extrabold text-[#18231F]">
                  Swipe <span className="text-[#2D8060]">Right to Keep</span> · <span className="text-[#C86462]">Left to Mark Delete</span>
                </p>
                <p className="text-[#737B75] mt-0.5">Nothing is deleted without your final review.</p>
              </div>
            </div>
            <button
              onClick={dismissTutorial}
              className="px-3 py-1.5 bg-[#244D3F] text-white font-bold text-[11px] rounded-xl hover:bg-[#18231F] transition-all cursor-pointer shrink-0 ml-2"
            >
              Got it
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card Deck Area: Top Card + 2 Subtly Layered Cards Behind */}
      <div className="relative flex-1 px-4 my-1 flex items-center justify-center overflow-hidden">
        {/* Layer 3: Backmost Card (index + 2) */}
        {afterNextMedia && (
          <div
            className="absolute inset-x-7 inset-y-3 bg-[#EAE8E2] rounded-3xl border border-[#E6E9E2] shadow-xs overflow-hidden flex items-center justify-center pointer-events-none transition-all duration-200"
            style={{
              transform: `scale(${
                exitDirection
                  ? 0.94
                  : 0.89 + dragFraction * 0.05
              }) translateY(${
                exitDirection
                  ? 8
                  : Math.max(18 - dragFraction * 10, 8)
              }px)`,
              opacity: exitDirection ? 0.8 : 0.55 + dragFraction * 0.25,
            }}
          >
            <img
              src={afterNextMedia.thumbnailUri || afterNextMedia.uri}
              alt=""
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain filter grayscale/30 opacity-60"
            />
          </div>
        )}

        {/* Layer 2: Middle Card (index + 1) */}
        {nextMedia && (
          <div
            className="absolute inset-x-5 inset-y-1.5 bg-white rounded-3xl border border-[#E6E9E2] shadow-sm overflow-hidden flex items-center justify-center pointer-events-none transition-all duration-200"
            style={{
              transform: `scale(${
                exitDirection
                  ? 1
                  : 0.94 + dragFraction * 0.06
              }) translateY(${
                exitDirection
                  ? 0
                  : Math.max(10 - dragFraction * 10, 0)
              }px)`,
              opacity: exitDirection ? 1 : 0.82 + dragFraction * 0.18,
            }}
          >
            <img
              src={nextMedia.thumbnailUri || nextMedia.uri}
              alt=""
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain bg-[#18231F]/5"
            />
            <div className="absolute bottom-3 left-4 text-[11px] font-bold text-[#737B75] bg-white/85 px-2.5 py-1 rounded-xl border border-[#E6E9E2] shadow-2xs">
              Up next
            </div>
          </div>
        )}

        {/* Layer 1: Top Active Card (Swipable with spring physics) */}
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="relative w-full h-full max-h-[580px] bg-white rounded-3xl border border-[#E6E9E2] shadow-xl overflow-hidden flex flex-col cursor-grab active:cursor-grabbing select-none"
          style={{
            transform:
              exitDirection === 'right'
                ? 'translate3d(500px, 20px, 0) rotate(22deg)'
                : exitDirection === 'left'
                ? 'translate3d(-500px, 20px, 0) rotate(-22deg)'
                : isReturningFromUndo
                ? 'translate3d(0, 0, 0) scale(1)'
                : `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0) rotate(${rotation}deg)`,
            transition: isDragging
              ? 'none'
              : 'transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.22s ease',
            opacity: exitDirection ? 0 : 1,
          }}
        >
          {/* Progressive KEEP Badge Stamp (Green) */}
          <div
            className="absolute top-6 left-6 z-20 pointer-events-none border-2 border-[#2D8060] bg-[#2D8060] text-white font-extrabold text-sm sm:text-base tracking-wider px-3.5 py-1.5 rounded-xl uppercase shadow-lg flex items-center gap-1.5 transition-transform"
            style={{
              opacity: exitDirection === 'right' ? 1 : keepOpacity,
              transform: `scale(${0.75 + (exitDirection === 'right' ? 1 : keepOpacity) * 0.25}) rotate(-8deg)`,
            }}
          >
            <Check className="w-5 h-5 stroke-[3]" />
            <span>KEEP</span>
          </div>

          {/* Progressive DELETE Badge Stamp (Soft Coral) */}
          <div
            className="absolute top-6 right-6 z-20 pointer-events-none border-2 border-[#C86462] bg-[#C86462] text-white font-extrabold text-sm sm:text-base tracking-wider px-3.5 py-1.5 rounded-xl uppercase shadow-lg flex items-center gap-1.5 transition-transform"
            style={{
              opacity: exitDirection === 'left' ? 1 : deleteOpacity,
              transform: `scale(${0.75 + (exitDirection === 'left' ? 1 : deleteOpacity) * 0.25}) rotate(8deg)`,
            }}
          >
            <Trash2 className="w-5 h-5 stroke-[2.4]" />
            <span>DELETE</span>
          </div>

          {/* Media Content Box: Preserving natural aspect ratio without distortion */}
          <div className="relative flex-1 w-full bg-[#18231F]/5 overflow-hidden flex items-center justify-center">
            {currentMedia.mediaType === 'video' ? (
              <div className="relative w-full h-full flex items-center justify-center bg-black">
                <video
                  ref={videoRef}
                  src={currentMedia.uri}
                  loop
                  playsInline
                  muted={isMuted}
                  className="w-full h-full object-contain"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />

                {/* Video Playback Controls Overlay */}
                <div className="absolute bottom-4 inset-x-4 flex items-center justify-between z-10 bg-black/60 backdrop-blur-md px-3.5 py-2 rounded-2xl text-white">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (videoRef.current) {
                        if (isPlaying) videoRef.current.pause();
                        else videoRef.current.play();
                      }
                    }}
                    className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-xl bg-white/20 hover:bg-white/30 active:scale-95 transition-all cursor-pointer"
                  >
                    {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
                  </button>

                  <div className="text-[11px] font-mono tabular-nums text-white/90">
                    {currentMedia.duration ? `${currentMedia.duration}s` : 'Video Clip'}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMuted(!isMuted);
                    }}
                    className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-xl bg-white/20 hover:bg-white/30 active:scale-95 transition-all cursor-pointer"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ) : (
              <img
                src={currentMedia.uri}
                alt={currentMedia.filename}
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain pointer-events-none select-none"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (currentMedia.thumbnailUri && target.src !== currentMedia.thumbnailUri) {
                    target.src = currentMedia.thumbnailUri;
                  }
                }}
              />
            )}

            {/* Subtle Metadata Pill over image */}
            <div className="absolute top-3 left-3 bg-black/45 backdrop-blur-md text-white text-[10px] font-semibold px-2.5 py-1 rounded-xl flex items-center gap-1.5 shadow-xs">
              <span>{formatDate(currentMedia.creationTime)}</span>
              <span>·</span>
              <span className="tabular-nums">{formatBytes(currentMedia.fileSize)}</span>
            </div>

            {/* Bookmark star indicator */}
            {isCurrentBookmarked && (
              <div className="absolute top-3 right-3 bg-amber-500 text-white p-1.5 rounded-xl shadow-md">
                <Star className="w-3.5 h-3.5 fill-white" />
              </div>
            )}
          </div>

          {/* Quick Caption Bar at Card Bottom */}
          <div className="p-3 bg-white border-t border-[#E6E9E2] flex items-center justify-between">
            <div className="truncate mr-2">
              <div className="text-xs font-bold text-[#18231F] truncate">
                {currentMedia.filename}
              </div>
              <div className="text-[11px] text-[#737B75] flex items-center gap-2">
                <span>{currentMedia.albumName || 'Camera'}</span>
                <span>·</span>
                <span className="tabular-nums font-mono">
                  {currentMedia.width}×{currentMedia.height}
                </span>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowInfoSheet(true);
              }}
              className="min-h-[36px] min-w-[36px] flex items-center justify-center text-[#737B75] hover:text-[#18231F] rounded-xl hover:bg-[#F8F7F3] active:scale-95 transition-all shrink-0 cursor-pointer"
              title="Media Details"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Tactile Tinder Action Bar: Comfortable touch targets, press animations & icons */}
      <div className="px-6 py-2 shrink-0 flex items-center justify-between max-w-sm mx-auto w-full">
        {/* Delete Button (Alternative to swipe left) */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.88 }}
          onClick={() => triggerDecision('delete')}
          className="w-14 h-14 rounded-full bg-white border-2 border-[#C86462]/40 text-[#C86462] flex items-center justify-center shadow-md hover:bg-red-50 cursor-pointer transition-colors"
          aria-label="Delete / Mark for deletion"
          title="Delete (Swipe Left or ArrowLeft)"
        >
          <Trash2 className="w-6 h-6 stroke-[2.4]" />
        </motion.button>

        {/* Undo Button with count of available undos */}
        <motion.button
          whileHover={session.history.length > 0 ? { scale: 1.1 } : {}}
          whileTap={session.history.length > 0 ? { scale: 0.88 } : {}}
          onClick={handleUndo}
          disabled={session.history.length === 0}
          className={`relative w-12 h-12 rounded-full flex items-center justify-center border transition-all ${
            session.history.length > 0
              ? 'bg-white border-[#E6E9E2] text-[#18231F] hover:bg-[#F8F7F3] shadow-sm cursor-pointer'
              : 'bg-transparent border-transparent text-[#737B75]/30 cursor-not-allowed'
          }`}
          aria-label="Undo previous decision"
          title="Undo (Z)"
        >
          <RotateCcw className="w-4 h-4" />
          {session.history.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#244D3F] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {session.history.length}
            </span>
          )}
        </motion.button>

        {/* Bookmark Star Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.88 }}
          onClick={handleToggleBookmark}
          className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
            isCurrentBookmarked
              ? 'bg-amber-500 border-amber-500 text-white shadow-md'
              : 'bg-white border-[#E6E9E2] text-[#737B75] hover:text-[#18231F] hover:bg-[#F8F7F3] shadow-sm'
          }`}
          aria-label="Bookmark photo"
          title="Bookmark (ArrowUp)"
        >
          <Star className={`w-5 h-5 ${isCurrentBookmarked ? 'fill-white' : ''}`} />
        </motion.button>

        {/* Keep Button (Alternative to swipe right) */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.88 }}
          onClick={() => triggerDecision('keep')}
          className="w-14 h-14 rounded-full bg-[#2D8060] hover:bg-[#244D3F] text-white flex items-center justify-center shadow-md cursor-pointer transition-colors"
          aria-label="Keep photo"
          title="Keep (Swipe Right or ArrowRight)"
        >
          <Check className="w-7 h-7 stroke-[3]" />
        </motion.button>
      </div>

      {/* Media Details Modal Sheet */}
      {showInfoSheet && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-[#E6E9E2] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E6E9E2]">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-[#244D3F]" />
                <h3 className="text-sm font-bold text-[#18231F]">Media Details</h3>
              </div>
              <button
                onClick={() => setShowInfoSheet(false)}
                className="w-8 h-8 rounded-full bg-[#F8F7F3] flex items-center justify-center text-[#737B75] hover:text-[#18231F] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-[#E6E9E2]/60">
                <span className="text-[#737B75]">Filename</span>
                <span className="font-semibold text-[#18231F] truncate max-w-[200px]">
                  {currentMedia.filename}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E6E9E2]/60">
                <span className="text-[#737B75]">Date Taken</span>
                <span className="font-medium text-[#18231F]">
                  {formatDate(currentMedia.creationTime)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E6E9E2]/60">
                <span className="text-[#737B75]">Dimensions</span>
                <span className="font-mono tabular-nums text-[#18231F]">
                  {currentMedia.width} × {currentMedia.height}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E6E9E2]/60">
                <span className="text-[#737B75]">File Size</span>
                <span className="font-bold text-[#244D3F] tabular-nums">
                  {formatBytes(currentMedia.fileSize)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E6E9E2]/60">
                <span className="text-[#737B75]">Album</span>
                <span className="font-medium text-[#18231F]">
                  {currentMedia.albumName || 'Camera'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#737B75]">Media Format</span>
                <span className="uppercase font-semibold text-[#18231F]">
                  {currentMedia.mediaType}
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowInfoSheet(false)}
              className="w-full py-2.5 bg-[#F8F7F3] text-[#18231F] font-bold text-xs rounded-xl hover:bg-[#E6E9E2] transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
