import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Trash2,
  Check,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Camera,
  Coffee,
  Receipt,
  EyeOff,
  Lock,
  Heart,
  Smartphone,
  Layers,
  ArrowRight,
  Shield,
} from 'lucide-react';

/* -------------------------------------------------------------------------- */
/* FULL-SCREEN VECTOR 1: The Clutter Trap & The Pure Memory                   */
/* -------------------------------------------------------------------------- */
export const ClutterAvalancheVector: React.FC = () => {
  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCleared(true);
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-full h-[320px] sm:h-[350px] flex items-center justify-center select-none overflow-hidden rounded-3xl bg-gradient-to-b from-[#F2F0E8] via-[#F8F7F3] to-[#F8F7F3] border border-[#E6E9E2] shadow-sm">
      {/* Ambient background light orbs */}
      <motion.div
        animate={{
          scale: cleared ? 1.4 : 1,
          opacity: cleared ? 0.6 : 0.25,
          backgroundColor: cleared ? '#DCE8B0' : '#E6E9E2',
        }}
        transition={{ duration: 0.9 }}
        className="absolute w-72 h-72 rounded-full blur-3xl pointer-events-none"
      />

      {/* Floating Status Pill */}
      <div className="absolute top-4 inset-x-5 flex items-center justify-between z-30 pointer-events-none">
        <span className="text-[11px] font-bold text-[#737B75] uppercase tracking-wider bg-white/80 px-2.5 py-1 rounded-full border border-[#E6E9E2]">
          Camera Roll Clutter
        </span>
        <motion.span
          animate={{
            backgroundColor: cleared ? '#2D8060' : '#FEE2E2',
            color: cleared ? '#FFFFFF' : '#C86462',
            scale: cleared ? [0.95, 1.08, 1] : 1,
          }}
          transition={{ duration: 0.4 }}
          className="text-[11px] font-bold px-3 py-1 rounded-full shadow-xs"
        >
          {cleared ? '+6.8 GB Storage Freed' : '14,280 Cluttered Photos'}
        </motion.span>
      </div>

      {/* Centerpiece: The Pristine Framed Memory */}
      <motion.div
        animate={{
          scale: cleared ? 1.1 : 0.92,
          opacity: cleared ? 1 : 0.85,
          y: cleared ? -6 : 0,
        }}
        transition={{ type: 'spring', damping: 18, stiffness: 220 }}
        className="relative z-10 w-56 h-44 rounded-3xl bg-white border-2 border-[#244D3F] p-3 shadow-xl flex flex-col justify-between"
      >
        <div className="relative w-full h-28 rounded-2xl overflow-hidden bg-gradient-to-tr from-amber-100 via-orange-50 to-emerald-100 flex items-center justify-center border border-[#E6E9E2]">
          <div className="absolute inset-0 flex flex-col items-center justify-center text-[#244D3F]">
            <motion.div
              animate={cleared ? { scale: [1, 1.25, 1], rotate: [0, 6, -6, 0] } : {}}
              transition={{ repeat: Infinity, repeatDelay: 2, duration: 1.2 }}
            >
              <Heart className="w-10 h-10 fill-[#2D8060] text-[#2D8060]" />
            </motion.div>
            <span className="text-xs font-extrabold mt-1 text-[#244D3F]">Cherished Memory</span>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: cleared ? 1 : 0, scale: cleared ? 1 : 0.8 }}
            className="absolute bottom-2 right-2 bg-white/95 backdrop-blur-xs text-[10px] font-bold text-[#244D3F] px-2.5 py-1 rounded-lg shadow-sm flex items-center gap-1"
          >
            <Check className="w-3.5 h-3.5 text-[#2D8060] stroke-[3]" />
            <span>Keep Forever</span>
          </motion.div>
        </div>

        <div className="flex items-center justify-between text-xs pt-1 px-1">
          <span className="font-bold text-[#18231F] truncate max-w-[130px]">
            YosemiteSunset_2026.jpg
          </span>
          <span className="text-[#2D8060] font-bold tabular-nums">4.2 MB</span>
        </div>
      </motion.div>

      {/* Clutter Card 1: Blurry pocket photo with red camera shake */}
      <motion.div
        animate={
          cleared
            ? { x: -210, y: -130, rotate: -35, opacity: 0, scale: 0.5 }
            : {
                x: -72,
                y: [-30, -36, -30],
                rotate: -11,
                opacity: 0.98,
                scale: 1,
              }
        }
        transition={
          cleared
            ? { duration: 0.7, ease: [0.16, 1, 0.3, 1] }
            : { y: { repeat: Infinity, duration: 2.8, ease: 'easeInOut' } }
        }
        className="absolute z-20 w-44 h-34 rounded-2xl bg-white border border-red-200 p-2.5 shadow-lg flex flex-col justify-between pointer-events-none"
      >
        <div className="w-full h-20 rounded-xl bg-red-50/70 flex flex-col items-center justify-center border border-dashed border-red-200">
          <EyeOff className="w-6 h-6 text-[#C86462] mb-1 animate-pulse" />
          <span className="text-[11px] text-[#C86462] font-bold">Blurry pocket shot</span>
        </div>
        <div className="flex items-center justify-between text-[10px] text-[#C86462] font-semibold">
          <span>Accidental capture</span>
          <span className="bg-red-50 px-1.5 py-0.5 rounded tabular-nums font-bold">3.4 MB</span>
        </div>
      </motion.div>

      {/* Clutter Card 2: Receipt screenshot */}
      <motion.div
        animate={
          cleared
            ? { x: 210, y: -120, rotate: 32, opacity: 0, scale: 0.5 }
            : {
                x: 72,
                y: [-32, -26, -32],
                rotate: 10,
                opacity: 0.98,
                scale: 1,
              }
        }
        transition={
          cleared
            ? { duration: 0.7, ease: [0.16, 1, 0.3, 1] }
            : { y: { repeat: Infinity, duration: 3.0, ease: 'easeInOut', delay: 0.2 } }
        }
        className="absolute z-20 w-44 h-34 rounded-2xl bg-white border border-gray-200 p-2.5 shadow-lg flex flex-col justify-between pointer-events-none"
      >
        <div className="w-full h-20 rounded-xl bg-gray-50 flex flex-col items-center justify-center border border-gray-200">
          <Receipt className="w-6 h-6 text-gray-500 mb-1" />
          <span className="text-[11px] font-mono text-gray-700 font-bold">$38.50 Grocery.png</span>
        </div>
        <div className="flex items-center justify-between text-[10px] text-[#737B75] font-semibold">
          <span>Screenshot</span>
          <span className="bg-gray-100 px-1.5 py-0.5 rounded tabular-nums font-bold">1.9 MB</span>
        </div>
      </motion.div>

      {/* Clutter Card 3: Duplicate burst shots */}
      <motion.div
        animate={
          cleared
            ? { y: 180, scale: 0.5, opacity: 0 }
            : {
                y: [48, 42, 48],
                rotate: -2,
                opacity: 1,
                scale: 1,
              }
        }
        transition={
          cleared
            ? { duration: 0.7, ease: [0.16, 1, 0.3, 1] }
            : { y: { repeat: Infinity, duration: 2.6, ease: 'easeInOut', delay: 0.4 } }
        }
        className="absolute z-30 w-44 h-34 rounded-2xl bg-white border border-amber-200 p-2.5 shadow-xl flex flex-col justify-between pointer-events-none"
      >
        <div className="w-full h-20 rounded-xl bg-amber-50/80 flex flex-col items-center justify-center border border-amber-200">
          <Coffee className="w-6 h-6 text-amber-800 mb-1" />
          <span className="text-[11px] text-amber-900 font-bold">Duplicate burst (5 of 8)</span>
        </div>
        <div className="flex items-center justify-between text-[10px] text-amber-900 font-semibold">
          <span>Identical shot</span>
          <span className="bg-amber-100 px-1.5 py-0.5 rounded tabular-nums font-bold">4.1 MB</span>
        </div>
      </motion.div>

      {/* Interactive Trigger Pill */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setCleared(!cleared)}
        className="absolute bottom-3.5 z-40 px-4 py-1.5 bg-[#18231F] text-white hover:bg-[#244D3F] rounded-full text-xs font-bold shadow-lg flex items-center gap-1.5 cursor-pointer"
      >
        <Sparkles className="w-3.5 h-3.5 text-[#DCE8B0]" />
        <span>{cleared ? 'Show Cluttered Roll' : 'Tap to Clear Clutter'}</span>
      </motion.button>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* FULL-SCREEN VECTOR 2: The Physical Swipe Deck Experience                   */
/* -------------------------------------------------------------------------- */
export const IntuitiveSwipeVector: React.FC = () => {
  const [dragX, setDragX] = useState(0);
  const [lastAction, setLastAction] = useState<'keep' | 'delete' | null>(null);

  const keepOpacity = Math.min(Math.max((dragX - 10) / 45, 0), 1);
  const deleteOpacity = Math.min(Math.max((-dragX - 10) / 45, 0), 1);

  return (
    <div className="relative w-full h-[320px] sm:h-[350px] flex flex-col items-center justify-center select-none overflow-hidden rounded-3xl bg-gradient-to-b from-[#F2F0E8] via-[#F8F7F3] to-[#F8F7F3] border border-[#E6E9E2] shadow-sm touch-none">
      {/* Directional Guides at Top */}
      <div className="absolute inset-x-5 top-4 flex items-center justify-between text-[11px] font-extrabold tracking-wide pointer-events-none z-30">
        <span className="text-[#C86462] flex items-center gap-1 bg-red-50/90 px-2.5 py-1 rounded-xl border border-red-200 shadow-2xs">
          <Trash2 className="w-3.5 h-3.5" /> SWIPE LEFT TO TOSS
        </span>
        <span className="text-[#2D8060] flex items-center gap-1 bg-emerald-50/90 px-2.5 py-1 rounded-xl border border-emerald-200 shadow-2xs">
          SWIPE RIGHT TO KEEP <Check className="w-3.5 h-3.5 stroke-[3]" />
        </span>
      </div>

      {/* Underneath Card in Stack */}
      <div
        className="absolute w-52 h-44 bg-[#F8F7F3] rounded-3xl border border-[#E6E9E2] shadow-sm p-3 flex flex-col justify-between pointer-events-none"
        style={{
          transform: 'scale(0.92) translateY(14px)',
          opacity: 0.75,
        }}
      >
        <div className="w-full h-28 rounded-2xl bg-slate-200/80 flex items-center justify-center">
          <Camera className="w-10 h-10 text-slate-400" />
        </div>
        <div className="text-xs text-[#737B75] text-center font-bold">Up Next</div>
      </div>

      {/* Interactive Top Swipable Card powered by motion/react */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -140, right: 140 }}
        dragElastic={0.65}
        onDrag={(_, info) => setDragX(info.offset.x)}
        onDragEnd={(_, info) => {
          if (info.offset.x > 50) {
            setLastAction('keep');
          } else if (info.offset.x < -50) {
            setLastAction('delete');
          }
          setDragX(0);
        }}
        animate={{
          x: 0,
          rotate: dragX * 0.12,
        }}
        whileTap={{ cursor: 'grabbing', scale: 1.02 }}
        className="relative z-10 w-56 h-48 bg-white rounded-3xl border-2 border-[#E6E9E2] shadow-xl p-3 flex flex-col justify-between cursor-grab select-none"
      >
        {/* Dynamic Stamp Keep */}
        <div
          className="absolute top-4 left-4 z-20 border-2 border-[#2D8060] bg-[#2D8060] text-white text-xs font-extrabold px-3 py-1 rounded-xl shadow-md flex items-center gap-1.5 pointer-events-none"
          style={{
            opacity: keepOpacity,
            transform: `scale(${0.8 + keepOpacity * 0.2}) rotate(-8deg)`,
          }}
        >
          <Check className="w-4 h-4 stroke-[3]" /> KEEP
        </div>

        {/* Dynamic Stamp Delete */}
        <div
          className="absolute top-4 right-4 z-20 border-2 border-[#C86462] bg-[#C86462] text-white text-xs font-extrabold px-3 py-1 rounded-xl shadow-md flex items-center gap-1.5 pointer-events-none"
          style={{
            opacity: deleteOpacity,
            transform: `scale(${0.8 + deleteOpacity * 0.2}) rotate(8deg)`,
          }}
        >
          <Trash2 className="w-4 h-4" /> DELETE
        </div>

        {/* Card Artwork */}
        <div className="w-full h-32 rounded-2xl bg-gradient-to-br from-teal-50 via-emerald-100 to-amber-50 flex items-center justify-center overflow-hidden border border-[#E6E9E2]">
          <Camera className="w-12 h-12 text-[#244D3F]" />
        </div>

        <div className="flex items-center justify-between text-xs text-[#737B75] pt-1 px-1">
          <span className="font-bold text-[#18231F]">Drag card right or left</span>
          <span className="font-mono text-[#244D3F] font-bold">3.8 MB</span>
        </div>
      </motion.div>

      {/* Floating Animated Guide Hand when idle */}
      {!lastAction && dragX === 0 && (
        <motion.div
          animate={{
            x: [-24, 24, -24],
            opacity: [0.4, 0.9, 0.4],
          }}
          transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
          className="absolute z-20 pointer-events-none flex items-center gap-1.5 text-xs font-bold text-[#244D3F] bg-white/95 backdrop-blur-xs px-3.5 py-1.5 rounded-full shadow-md border border-[#E6E9E2]"
        >
          <span>Drag with mouse / thumb</span>
        </motion.div>
      )}

      {/* Action feedback status */}
      <div className="absolute bottom-3 text-xs font-bold text-[#737B75]">
        {lastAction === 'keep' && (
          <motion.span
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[#2D8060] flex items-center gap-1 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200"
          >
            <Check className="w-4 h-4 stroke-[3]" /> Kept! Preserved in your permanent gallery.
          </motion.span>
        )}
        {lastAction === 'delete' && (
          <motion.span
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[#C86462] flex items-center gap-1 bg-red-50 px-3 py-1 rounded-full border border-red-200"
          >
            <Trash2 className="w-4 h-4" /> Marked for review. Nothing is removed yet!
          </motion.span>
        )}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* FULL-SCREEN VECTOR 3: The Holographic Safety Vault                         */
/* -------------------------------------------------------------------------- */
export const SafetyVaultVector: React.FC = () => {
  const [undoActive, setUndoActive] = useState(false);

  const handleTestUndo = () => {
    setUndoActive(true);
    setTimeout(() => setUndoActive(false), 1400);
  };

  return (
    <div className="relative w-full h-[320px] sm:h-[350px] flex flex-col items-center justify-center select-none overflow-hidden rounded-3xl bg-gradient-to-b from-[#F2F0E8] via-[#F8F7F3] to-[#F8F7F3] border border-[#E6E9E2] shadow-sm">
      {/* Central Shield Vault with animated pulsing rings */}
      <div className="relative flex items-center justify-center mb-4">
        <motion.div
          animate={{
            scale: undoActive ? [1, 1.45, 1.2] : [1, 1.2, 1],
            opacity: undoActive ? 0.75 : 0.35,
          }}
          transition={{ duration: 1.2, repeat: undoActive ? 0 : Infinity }}
          className="absolute w-44 h-44 rounded-full bg-[#DCE8B0] blur-2xl"
        />

        <motion.div
          animate={{ rotate: undoActive ? [0, -360] : 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-24 h-24 rounded-3xl bg-white border-2 border-[#244D3F] shadow-xl flex items-center justify-center text-[#244D3F]"
        >
          <ShieldCheck className="w-12 h-12 text-[#2D8060]" />
        </motion.div>

        {/* Orbiting Review Tray Left */}
        <motion.div
          animate={{
            x: undoActive ? 16 : 0,
            scale: undoActive ? 0.8 : 1,
            opacity: undoActive ? 0.3 : 0.95,
          }}
          transition={{ duration: 0.5 }}
          className="absolute -left-20 w-32 p-3 bg-white rounded-2xl border border-red-200 shadow-md flex flex-col text-xs"
        >
          <div className="flex items-center gap-1.5 text-[#C86462] font-bold">
            <Trash2 className="w-4 h-4" /> Review Tray
          </div>
          <span className="text-[#737B75] mt-1 text-[10px]">4 candidates pending</span>
        </motion.div>

        {/* Orbiting Kept Tray Right */}
        <motion.div
          animate={{
            scale: undoActive ? 1.15 : 1,
            boxShadow: undoActive
              ? '0 12px 28px -5px rgba(45, 128, 96, 0.35)'
              : '0 2px 6px 0 rgba(0, 0, 0, 0.08)',
          }}
          transition={{ duration: 0.5 }}
          className="absolute -right-20 w-32 p-3 bg-white rounded-2xl border border-emerald-200 shadow-md flex flex-col text-xs"
        >
          <div className="flex items-center gap-1.5 text-[#2D8060] font-bold">
            <Check className="w-4 h-4 stroke-[3]" /> Protected
          </div>
          <span className="text-[#737B75] mt-1 text-[10px]">Safe on device</span>
        </motion.div>
      </div>

      <div className="text-center px-6 max-w-sm space-y-1">
        <h4 className="text-sm font-extrabold text-[#18231F]">
          {undoActive ? 'Photo instantly restored!' : 'Swiping left only marks. You confirm before delete.'}
        </h4>
        <p className="text-xs text-[#737B75]">
          A visual review grid lets you restore any item with a single tap.
        </p>
      </div>

      {/* Interactive Undo Test Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleTestUndo}
        className="mt-3.5 px-5 py-2 bg-white hover:bg-[#F8F7F3] text-[#18231F] border border-[#E6E9E2] rounded-full text-xs font-bold shadow-md flex items-center gap-2 cursor-pointer"
      >
        <RotateCcw className={`w-4 h-4 text-[#244D3F] ${undoActive ? 'animate-spin' : ''}`} />
        <span>Test Instant Undo</span>
      </motion.button>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* FULL-SCREEN VECTOR 4: 100% On-Device Privacy Scanner                      */
/* -------------------------------------------------------------------------- */
export const PrivateScanVector: React.FC = () => {
  return (
    <div className="relative w-full h-[320px] sm:h-[350px] flex flex-col items-center justify-center select-none overflow-hidden rounded-3xl bg-gradient-to-b from-[#F2F0E8] via-[#F8F7F3] to-[#F8F7F3] border border-[#E6E9E2] shadow-sm">
      {/* Animated Scanning Beam & Mini Gallery Matrix */}
      <div className="relative w-64 h-44 bg-white rounded-3xl border-2 border-[#E6E9E2] shadow-xl p-3 overflow-hidden flex flex-col justify-between">
        {/* Animated Laser Beam sweeping vertically via motion */}
        <motion.div
          animate={{
            y: [-12, 148, -12],
          }}
          transition={{
            repeat: Infinity,
            duration: 2.2,
            ease: 'easeInOut',
          }}
          className="absolute inset-x-0 h-1.5 bg-gradient-to-r from-transparent via-[#2D8060] to-transparent shadow-[0_0_14px_#2D8060] pointer-events-none z-20"
        />

        {/* 6 mini monthly photo folders organized into monthly blocks */}
        <div className="grid grid-cols-3 gap-2 flex-1 relative z-10 pt-1">
          {[
            { label: 'Oct 2026', color: 'bg-emerald-50 text-emerald-800' },
            { label: 'Sep 2026', color: 'bg-amber-50 text-amber-800' },
            { label: 'Aug 2026', color: 'bg-teal-50 text-teal-800' },
            { label: 'Jul 2026', color: 'bg-sky-50 text-sky-800' },
            { label: 'Jun 2026', color: 'bg-indigo-50 text-indigo-800' },
            { label: 'May 2026', color: 'bg-rose-50 text-rose-800' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0.6 }}
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ repeat: Infinity, duration: 2.2, delay: i * 0.2 }}
              className={`rounded-xl ${item.color} border border-[#E6E9E2] flex flex-col items-center justify-center text-[10px] font-bold shadow-2xs py-2`}
            >
              <Camera className="w-4 h-4 opacity-75 mb-1" />
              <span>{item.label}</span>
            </motion.div>
          ))}
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono text-[#737B75] pt-2 border-t border-[#E6E9E2]">
          <span className="flex items-center gap-1.5 text-[#2D8060] font-bold">
            <Lock className="w-3.5 h-3.5" /> 100% On-Device
          </span>
          <span className="text-[#18231F] font-bold">0 B sent to cloud</span>
        </div>
      </div>

      <div className="mt-4 text-center px-6 max-w-sm space-y-1">
        <h4 className="text-sm font-extrabold text-[#18231F]">
          Completely private & offline
        </h4>
        <p className="text-xs text-[#737B75]">
          Your personal photos never leave your device storage.
        </p>
      </div>
    </div>
  );
};
