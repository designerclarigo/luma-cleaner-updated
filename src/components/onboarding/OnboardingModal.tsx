import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LumaLogo } from '../brand/LumaLogo';
import {
  ArrowRight,
  ArrowLeft,
  Camera,
  FolderSync,
  ShieldCheck,
  Wifi,
  Battery,
  Lock,
  Heart,
  Trash2,
  Check,
  Receipt,
  Coffee,
  EyeOff,
  Sparkles,
  RotateCcw,
  Shield,
  Layers,
  HardDrive,
} from 'lucide-react';

interface OnboardingModalProps {
  onComplete: () => void;
}

/* ========================================================================== */
/* VECTOR SCENE 1: "Your memories. Less clutter."                              */
/* Full-screen animated vector illustration with scattered-to-stacked photos   */
/* ========================================================================== */
const MemoriesOrganizeFullVector: React.FC = () => {
  const [isStacked, setIsStacked] = useState(true);

  return (
    <div className="relative w-full h-[360px] sm:h-[400px] flex items-center justify-center select-none overflow-hidden rounded-3xl bg-gradient-to-b from-[#F3F1EB] via-[#F8F7F3] to-[#F8F7F3] border border-[#E6E9E2] shadow-sm">
      {/* Radiant Background Aura */}
      <motion.div
        animate={{
          scale: isStacked ? [1, 1.25, 1.1] : 0.9,
          opacity: isStacked ? 0.55 : 0.25,
        }}
        transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
        className="absolute w-80 h-80 rounded-full bg-[#DCE8B0]/60 blur-3xl pointer-events-none"
      />

      {/* Floating Sparkle Particles */}
      <motion.div
        animate={{ y: [-8, 8, -8], rotate: [0, 15, -15, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-6 right-8 text-[#2D8060] pointer-events-none"
      >
        <Sparkles className="w-6 h-6 opacity-80" />
      </motion.div>

      <motion.div
        animate={{ y: [6, -6, 6], rotate: [0, -20, 20, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        className="absolute bottom-12 left-8 text-[#244D3F] pointer-events-none"
      >
        <Sparkles className="w-5 h-5 opacity-60" />
      </motion.div>

      {/* Top Banner Tag */}
      <div className="absolute top-3.5 inset-x-5 flex items-center justify-between z-30 pointer-events-none">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#244D3F] bg-[#DCE8B0]/80 px-2.5 py-1 rounded-full border border-[#DCE8B0]">
          Smart Stack
        </span>
        <span className="text-[10px] font-bold text-[#737B75] bg-white/90 px-2.5 py-1 rounded-full border border-[#E6E9E2] shadow-2xs">
          {isStacked ? 'Organized by Month' : 'Camera Roll Chaos'}
        </span>
      </div>

      {/* SVG Decorative Lens Aperture in Background */}
      <svg
        className="absolute inset-0 w-full h-full opacity-20 pointer-events-none"
        viewBox="0 0 400 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="200" cy="180" r="140" stroke="#244D3F" strokeWidth="1.5" strokeDasharray="4 8" />
        <circle cx="200" cy="180" r="90" stroke="#2D8060" strokeWidth="1" />
        <line x1="200" y1="20" x2="200" y2="340" stroke="#244D3F" strokeWidth="0.8" strokeDasharray="3 6" />
        <line x1="40" y1="180" x2="360" y2="180" stroke="#244D3F" strokeWidth="0.8" strokeDasharray="3 6" />
      </svg>

      {/* Scattered / Stacked Cards Container */}
      <div className="relative w-64 h-56 flex items-center justify-center">
        {/* Card 4: Bursts / Coffee duplicate */}
        <motion.div
          animate={
            isStacked
              ? { x: 0, y: 18, rotate: 6, scale: 0.88, opacity: 0.75 }
              : { x: 80, y: -50, rotate: 18, scale: 0.95, opacity: 0.95 }
          }
          transition={{ type: 'spring', damping: 16, stiffness: 220 }}
          className="absolute z-10 w-48 h-40 bg-white rounded-3xl border border-[#E6E9E2] p-2.5 shadow-md flex flex-col justify-between"
        >
          <div className="w-full h-24 rounded-2xl bg-amber-50/80 border border-amber-200 flex flex-col items-center justify-center">
            <Coffee className="w-7 h-7 text-amber-800 mb-1" />
            <span className="text-[10px] font-bold text-amber-900">Burst #4 (Identical)</span>
          </div>
          <div className="flex items-center justify-between text-[10px] font-semibold text-[#737B75] px-1">
            <span>MorningRoast.jpg</span>
            <span className="tabular-nums">3.8 MB</span>
          </div>
        </motion.div>

        {/* Card 3: Receipt Screenshot */}
        <motion.div
          animate={
            isStacked
              ? { x: 0, y: 9, rotate: -4, scale: 0.94, opacity: 0.85 }
              : { x: -85, y: -40, rotate: -16, scale: 0.95, opacity: 0.95 }
          }
          transition={{ type: 'spring', damping: 16, stiffness: 220, delay: 0.04 }}
          className="absolute z-20 w-48 h-40 bg-white rounded-3xl border border-[#E6E9E2] p-2.5 shadow-md flex flex-col justify-between"
        >
          <div className="w-full h-24 rounded-2xl bg-gray-50 border border-gray-200 flex flex-col items-center justify-center">
            <Receipt className="w-7 h-7 text-gray-400 mb-1" />
            <span className="text-[10px] font-mono text-gray-700 font-bold">$24.50 Parking.png</span>
          </div>
          <div className="flex items-center justify-between text-[10px] font-semibold text-[#737B75] px-1">
            <span>Screenshot</span>
            <span className="tabular-nums">1.4 MB</span>
          </div>
        </motion.div>

        {/* Card 2: Blurry pocket shot */}
        <motion.div
          animate={
            isStacked
              ? { x: 0, y: 0, rotate: 2, scale: 0.98, opacity: 0.95 }
              : { x: -75, y: 55, rotate: -8, scale: 0.95, opacity: 0.95 }
          }
          transition={{ type: 'spring', damping: 16, stiffness: 220, delay: 0.08 }}
          className="absolute z-20 w-48 h-40 bg-white rounded-3xl border border-red-200 p-2.5 shadow-lg flex flex-col justify-between"
        >
          <div className="w-full h-24 rounded-2xl bg-red-50/70 border border-dashed border-red-200 flex flex-col items-center justify-center">
            <EyeOff className="w-7 h-7 text-[#C86462] mb-1" />
            <span className="text-[10px] font-bold text-[#C86462]">Accidental Pocket Shot</span>
          </div>
          <div className="flex items-center justify-between text-[10px] font-semibold text-[#C86462] px-1">
            <span>Motion blur</span>
            <span className="tabular-nums">4.1 MB</span>
          </div>
        </motion.div>

        {/* Card 1: Top Hero Golden Memory */}
        <motion.div
          animate={
            isStacked
              ? { x: 0, y: -8, rotate: 0, scale: 1.04, opacity: 1 }
              : { x: 25, y: 15, rotate: 4, scale: 1, opacity: 1 }
          }
          transition={{ type: 'spring', damping: 15, stiffness: 240, delay: 0.12 }}
          className="relative z-30 w-56 h-48 bg-white rounded-3xl border-2 border-[#244D3F] p-3 shadow-2xl flex flex-col justify-between"
        >
          <div className="relative w-full h-32 rounded-2xl overflow-hidden bg-gradient-to-tr from-emerald-100 via-teal-50 to-amber-100 flex items-center justify-center border border-[#E6E9E2]">
            <img
              src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=500&q=80"
              alt="Yosemite"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 right-2 bg-[#244D3F] text-[#DCE8B0] text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
              <Heart className="w-3 h-3 fill-current" />
              <span>Cherished</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs font-bold text-[#18231F] px-1">
            <span>YosemiteMist.jpg</span>
            <span className="text-[#2D8060] tabular-nums font-mono">4.2 MB</span>
          </div>
        </motion.div>
      </div>

      {/* Bottom Interactive Toggle */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsStacked(!isStacked)}
        className="absolute bottom-3.5 z-40 px-4 py-1.5 bg-[#18231F] hover:bg-[#244D3F] text-white rounded-full text-xs font-bold shadow-md flex items-center gap-2 cursor-pointer transition-colors"
      >
        <Sparkles className="w-3.5 h-3.5 text-[#DCE8B0]" />
        <span>{isStacked ? 'Tap to see Clutter Spread' : 'Tap to Organize Stack'}</span>
      </motion.button>
    </div>
  );
};

/* ========================================================================== */
/* VECTOR SCENE 2: "Swipe. Keep. Clear."                                       */
/* Full-screen animated Tinder-style swiping simulator                         */
/* ========================================================================== */
const SwipeKeepClearFullVector: React.FC = () => {
  const [dragX, setDragX] = useState(0);
  const [feedback, setFeedback] = useState<'keep' | 'delete' | null>(null);

  // Auto demonstration preview if untouched
  useEffect(() => {
    const t1 = setTimeout(() => {
      if (dragX === 0 && !feedback) setDragX(75);
    }, 600);
    const t2 = setTimeout(() => {
      if (dragX === 75) setDragX(-75);
    }, 1700);
    const t3 = setTimeout(() => {
      if (dragX === -75) setDragX(0);
    }, 2800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [feedback, dragX]);

  const keepOpacity = Math.min(Math.max((dragX - 10) / 45, 0), 1);
  const deleteOpacity = Math.min(Math.max((-dragX - 10) / 45, 0), 1);

  const simulateSwipe = (dir: 'keep' | 'delete') => {
    setFeedback(dir);
    if (dir === 'keep') {
      setDragX(120);
      setTimeout(() => {
        setDragX(0);
        setFeedback(null);
      }, 700);
    } else {
      setDragX(-120);
      setTimeout(() => {
        setDragX(0);
        setFeedback(null);
      }, 700);
    }
  };

  return (
    <div className="relative w-full h-[360px] sm:h-[400px] flex flex-col items-center justify-center select-none overflow-hidden rounded-3xl bg-gradient-to-b from-[#F3F1EB] via-[#F8F7F3] to-[#F8F7F3] border border-[#E6E9E2] shadow-sm touch-none">
      {/* Directional Guides at Top */}
      <div className="absolute inset-x-5 top-3.5 flex items-center justify-between text-[10px] font-extrabold tracking-wide pointer-events-none z-30">
        <span className="text-[#C86462] flex items-center gap-1 bg-red-50/95 px-2.5 py-1 rounded-xl border border-red-200 shadow-2xs">
          <Trash2 className="w-3.5 h-3.5" /> SWIPE LEFT TO DELETE
        </span>
        <span className="text-[#2D8060] flex items-center gap-1 bg-emerald-50/95 px-2.5 py-1 rounded-xl border border-emerald-200 shadow-2xs">
          SWIPE RIGHT TO KEEP <Check className="w-3.5 h-3.5 stroke-[3]" />
        </span>
      </div>

      {/* Underneath Card in Deck */}
      <div
        className="absolute w-52 h-44 bg-[#F8F7F3] rounded-3xl border border-[#E6E9E2] shadow-sm p-2 flex flex-col justify-between pointer-events-none"
        style={{
          transform: 'scale(0.92) translateY(16px)',
          opacity: 0.75,
        }}
      >
        <img
          src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=70"
          alt=""
          className="w-full h-28 object-cover rounded-2xl bg-slate-200"
        />
        <div className="text-xs text-[#737B75] text-center font-bold">Up Next in Deck</div>
      </div>

      {/* Interactive Swipable Top Card */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -140, right: 140 }}
        dragElastic={0.65}
        onDrag={(_, info) => setDragX(info.offset.x)}
        onDragEnd={(_, info) => {
          if (info.offset.x > 55) {
            simulateSwipe('keep');
          } else if (info.offset.x < -55) {
            simulateSwipe('delete');
          } else {
            setDragX(0);
          }
        }}
        animate={{
          x: dragX,
          rotate: dragX * 0.12,
        }}
        transition={{ type: 'spring', damping: 20, stiffness: 280 }}
        whileTap={{ cursor: 'grabbing', scale: 1.02 }}
        className="relative z-10 w-56 h-48 bg-white rounded-3xl border-2 border-[#E6E9E2] shadow-2xl p-2.5 flex flex-col justify-between cursor-grab select-none"
      >
        {/* Dynamic Stamp Keep */}
        <div
          className="absolute top-4 left-4 z-20 border-2 border-[#2D8060] bg-[#2D8060] text-white text-xs font-extrabold px-3 py-1 rounded-xl shadow-lg flex items-center gap-1.5 pointer-events-none"
          style={{
            opacity: keepOpacity,
            transform: `scale(${0.8 + keepOpacity * 0.2}) rotate(-8deg)`,
          }}
        >
          <Check className="w-4 h-4 stroke-[3]" /> KEEP
        </div>

        {/* Dynamic Stamp Delete */}
        <div
          className="absolute top-4 right-4 z-20 border-2 border-[#C86462] bg-[#C86462] text-white text-xs font-extrabold px-3 py-1 rounded-xl shadow-lg flex items-center gap-1.5 pointer-events-none"
          style={{
            opacity: deleteOpacity,
            transform: `scale(${0.8 + deleteOpacity * 0.2}) rotate(8deg)`,
          }}
        >
          <Trash2 className="w-4 h-4" /> DELETE
        </div>

        {/* Card Artwork */}
        <div className="relative w-full h-32 rounded-2xl overflow-hidden bg-slate-100">
          <img
            src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=500&q=75"
            alt="Pine Fog"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex items-center justify-between text-xs font-bold text-[#18231F] px-1">
          <span>PineFog_08.jpg</span>
          <span className="font-mono text-[#244D3F]">5.1 MB</span>
        </div>
      </motion.div>

      {/* Tactile Tinder-Style Bottom Action Buttons */}
      <div className="absolute bottom-3 z-30 flex items-center gap-4">
        {/* Red Discard Button */}
        <motion.button
          whileHover={{ scale: 1.12 }}
          whileTap={{ scale: 0.88 }}
          onClick={() => simulateSwipe('delete')}
          className="w-12 h-12 rounded-full bg-white border-2 border-[#C86462]/40 text-[#C86462] flex items-center justify-center shadow-md hover:bg-red-50 cursor-pointer transition-transform"
          title="Swipe Left / Discard"
        >
          <Trash2 className="w-5 h-5 stroke-[2.4]" />
        </motion.button>

        <span className="text-[11px] font-bold text-[#737B75] bg-white/90 px-3.5 py-1.5 rounded-full border border-[#E6E9E2] shadow-2xs">
          Drag card or tap
        </span>

        {/* Green Keep Button */}
        <motion.button
          whileHover={{ scale: 1.12 }}
          whileTap={{ scale: 0.88 }}
          onClick={() => simulateSwipe('keep')}
          className="w-12 h-12 rounded-full bg-[#2D8060] text-white flex items-center justify-center shadow-md hover:bg-[#244D3F] cursor-pointer transition-transform"
          title="Swipe Right / Keep"
        >
          <Check className="w-6 h-6 stroke-[3]" />
        </motion.button>
      </div>
    </div>
  );
};

/* ========================================================================== */
/* VECTOR SCENE 3: "Make room for what matters."                               */
/* Full-screen clutter flying away with reclaimed space celebration            */
/* ========================================================================== */
const MakeRoomFullVector: React.FC = () => {
  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setCleared(true), 1100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative w-full h-[360px] sm:h-[400px] flex flex-col items-center justify-center select-none overflow-hidden rounded-3xl bg-gradient-to-b from-[#F3F1EB] via-[#F8F7F3] to-[#F8F7F3] border border-[#E6E9E2] shadow-sm">
      {/* Radiant Background Aura */}
      <motion.div
        animate={{
          scale: cleared ? [1.1, 1.45, 1.3] : 1,
          opacity: cleared ? 0.7 : 0.25,
        }}
        transition={{ duration: 1.5, repeat: cleared ? Infinity : 0, repeatDelay: 0.8 }}
        className="absolute w-72 h-72 rounded-full bg-[#DCE8B0] blur-3xl pointer-events-none"
      />

      {/* Top Reclaimed Banner Tag */}
      <div className="absolute top-3.5 inset-x-5 flex items-center justify-between z-30 pointer-events-none">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#737B75] bg-white/90 px-2.5 py-1 rounded-full border border-[#E6E9E2]">
          Library Result
        </span>
        <motion.span
          animate={{
            scale: cleared ? [0.95, 1.12, 1] : 1,
          }}
          transition={{ duration: 0.4 }}
          className="text-[11px] font-bold bg-[#2D8060] text-white px-3 py-1 rounded-full shadow-xs flex items-center gap-1"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>+6.8 GB Reclaimed</span>
        </motion.span>
      </div>

      {/* Central Hero Memory That Remains */}
      <motion.div
        animate={{
          scale: cleared ? 1.08 : 0.94,
          y: cleared ? -6 : 0,
        }}
        transition={{ type: 'spring', damping: 16, stiffness: 220 }}
        className="relative z-10 w-56 h-48 rounded-3xl bg-white border-2 border-[#244D3F] p-3 shadow-2xl flex flex-col justify-between"
      >
        <div className="relative w-full h-32 rounded-2xl overflow-hidden bg-slate-100">
          <img
            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80"
            alt="Pacific Cove"
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-2 right-2 bg-white/95 backdrop-blur-xs text-[10px] font-bold text-[#244D3F] px-2.5 py-1 rounded-lg shadow-sm flex items-center gap-1">
            <Check className="w-3.5 h-3.5 text-[#2D8060] stroke-[3]" />
            <span>Preserved Memory</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs font-bold text-[#18231F] px-1">
          <span>PacificCove.jpg</span>
          <span className="text-[#2D8060] tabular-nums font-bold">4.8 MB</span>
        </div>
      </motion.div>

      {/* Unwanted Card 1 (Flying away to the left with spring motion) */}
      <motion.div
        animate={
          cleared
            ? { x: -240, y: -130, rotate: -38, opacity: 0, scale: 0.45 }
            : { x: -68, y: -25, rotate: -10, opacity: 0.95 }
        }
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="absolute z-20 w-44 h-34 rounded-2xl bg-white border border-red-200 p-2.5 shadow-lg flex flex-col justify-between pointer-events-none"
      >
        <div className="w-full h-20 rounded-xl bg-red-50/80 flex flex-col items-center justify-center border border-dashed border-red-200">
          <EyeOff className="w-6 h-6 text-[#C86462] mb-1" />
          <span className="text-[10px] text-[#C86462] font-bold">Blurry accidental</span>
        </div>
        <div className="flex items-center justify-between text-[10px] text-[#C86462] font-semibold">
          <span>Removed</span>
          <span className="tabular-nums">3.4 MB</span>
        </div>
      </motion.div>

      {/* Unwanted Card 2 (Flying away to the right with spring motion) */}
      <motion.div
        animate={
          cleared
            ? { x: 240, y: -120, rotate: 38, opacity: 0, scale: 0.45 }
            : { x: 68, y: -28, rotate: 10, opacity: 0.95 }
        }
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        className="absolute z-20 w-44 h-34 rounded-2xl bg-white border border-gray-200 p-2.5 shadow-lg flex flex-col justify-between pointer-events-none"
      >
        <div className="w-full h-20 rounded-xl bg-gray-50 flex flex-col items-center justify-center border border-gray-200">
          <Receipt className="w-6 h-6 text-gray-400 mb-1" />
          <span className="text-[10px] font-mono text-gray-700 font-bold">$38.50 Grocery.png</span>
        </div>
        <div className="flex items-center justify-between text-[10px] text-[#737B75] font-semibold">
          <span>Removed</span>
          <span className="tabular-nums">1.9 MB</span>
        </div>
      </motion.div>

      {/* Unwanted Card 3 (Flying downwards) */}
      <motion.div
        animate={
          cleared
            ? { y: 240, opacity: 0, scale: 0.45 }
            : { y: 48, rotate: -3, opacity: 0.95 }
        }
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
        className="absolute z-20 w-44 h-34 rounded-2xl bg-white border border-amber-200 p-2.5 shadow-lg flex flex-col justify-between pointer-events-none"
      >
        <div className="w-full h-20 rounded-xl bg-amber-50/80 flex flex-col items-center justify-center border border-amber-200">
          <Coffee className="w-6 h-6 text-amber-800 mb-1" />
          <span className="text-[10px] text-amber-900 font-bold">Duplicate burst shot</span>
        </div>
        <div className="flex items-center justify-between text-[10px] text-amber-900 font-semibold">
          <span>Removed</span>
          <span className="tabular-nums">4.1 MB</span>
        </div>
      </motion.div>

      {/* Bottom Replay Action */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setCleared(!cleared)}
        className="absolute bottom-3 z-30 px-4 py-1.5 bg-white/90 hover:bg-white text-[#18231F] border border-[#E6E9E2] rounded-full text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
      >
        <RotateCcw className="w-3.5 h-3.5 text-[#244D3F]" />
        <span>{cleared ? 'Show Clutter Leaving' : 'Simulate Cleaning'}</span>
      </motion.button>
    </div>
  );
};

/* ========================================================================== */
/* VECTOR SCENE 4: Permission & On-Device Security Stage                       */
/* ========================================================================== */
const PrivacyPermissionFullVector: React.FC = () => {
  return (
    <div className="relative w-full h-[360px] sm:h-[400px] flex flex-col items-center justify-center select-none overflow-hidden rounded-3xl bg-gradient-to-b from-[#F3F1EB] via-[#F8F7F3] to-[#F8F7F3] border border-[#E6E9E2] shadow-sm p-6 text-center">
      {/* Radiant Glow */}
      <div className="absolute w-56 h-56 rounded-full bg-[#DCE8B0]/50 blur-3xl pointer-events-none" />

      {/* Animated Shield Radar */}
      <div className="relative mb-5 flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0.1, 0.6] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute w-32 h-32 rounded-full border border-[#2D8060]"
        />
        <motion.div
          animate={{ scale: [1, 1.25, 1], opacity: [0.8, 0.3, 0.8] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
          className="absolute w-24 h-24 rounded-full border border-[#244D3F]"
        />

        <div className="relative w-20 h-20 rounded-3xl bg-white border-2 border-[#244D3F] shadow-xl flex items-center justify-center text-[#244D3F]">
          <ShieldCheck className="w-10 h-10 text-[#2D8060]" />
        </div>
      </div>

      <div className="space-y-2 max-w-xs z-10">
        <div className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#244D3F] bg-[#DCE8B0]/70 px-3 py-1 rounded-full">
          <Lock className="w-3 h-3" />
          <span>100% On-Device Privacy</span>
        </div>
        <h3 className="text-xl font-extrabold text-[#18231F] tracking-tight">
          Safe Gallery Access
        </h3>
        <p className="text-xs text-[#737B75] leading-relaxed">
          Luma only reads local photo metadata to organize monthly decks. Photos never leave your phone and nothing is deleted without your confirmation.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 w-full max-w-xs mt-4 z-10 text-[11px] font-semibold text-[#18231F]">
        <div className="bg-white/80 p-2.5 rounded-2xl border border-[#E6E9E2] flex items-center gap-2">
          <Check className="w-4 h-4 text-[#2D8060] shrink-0" />
          <span>Zero cloud uploads</span>
        </div>
        <div className="bg-white/80 p-2.5 rounded-2xl border border-[#E6E9E2] flex items-center gap-2">
          <Check className="w-4 h-4 text-[#2D8060] shrink-0" />
          <span>Review before delete</span>
        </div>
      </div>
    </div>
  );
};

/* ========================================================================== */
/* MAIN ONBOARDING MODAL COMPONENT                                            */
/* ========================================================================== */
export const OnboardingModal: React.FC<OnboardingModalProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [direction, setDirection] = useState<number>(1);
  const [isIndexing, setIsIndexing] = useState(false);
  const [indexedCount, setIndexedCount] = useState(0);

  const screens = [
    {
      id: 'memories',
      tag: '01. SMART STACK',
      title: 'Your memories. Less clutter.',
      subtitle:
        'Scattered snapshots, accidental receipts, and burst duplicates organize into neat, calm monthly card stacks.',
      component: <MemoriesOrganizeFullVector />,
      footer: 'Luma groups your library month by month for stress-free cleaning.',
    },
    {
      id: 'swipe',
      tag: '02. TACTILE SWIPING',
      title: 'Swipe. Keep. Clear.',
      subtitle:
        'Swipe right to keep the moments you treasure. Swipe left to mark unwanted photos for deletion.',
      component: <SwipeKeepClearFullVector />,
      footer: 'Finger-following card physics with visible tap alternatives.',
    },
    {
      id: 'makeroom',
      tag: '03. ZERO REGRETS',
      title: 'Make room for what matters.',
      subtitle:
        'Unwanted files move away while your favorite memories remain. Nothing is deleted without your final review.',
      component: <MakeRoomFullVector />,
      footer: '100% on-device privacy. Zero cloud uploads.',
    },
    {
      id: 'permission',
      tag: '04. PERMISSION',
      title: 'Connect your photo library',
      subtitle:
        'Luma needs read access to group your photos. Tap below to grant permission and start cleaning.',
      component: <PrivacyPermissionFullVector />,
      footer: 'Full privacy guarantee: works offline on your device.',
    },
  ];

  const handleNext = () => {
    if (currentStep < screens.length - 1) {
      setDirection(1);
      setCurrentStep((prev) => prev + 1);
    } else {
      handleGrantPermissionAndIndex();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleGrantPermissionAndIndex = () => {
    setIsIndexing(true);
    let count = 0;
    const interval = setInterval(() => {
      count += Math.floor(Math.random() * 4) + 1;
      setIndexedCount(count);
      if (count >= 13) {
        clearInterval(interval);
        setTimeout(() => {
          onComplete();
        }, 450);
      }
    }, 60);
  };

  const active = screens[currentStep];

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 80 : -80,
      opacity: 0,
      scale: 0.98,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.32,
        ease: 'easeOut' as const,
      },
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -80 : 80,
      opacity: 0,
      scale: 0.98,
      transition: {
        duration: 0.22,
        ease: 'easeOut' as const,
      },
    }),
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#F8F7F3] flex flex-col justify-between select-none overflow-hidden max-w-md mx-auto w-full shadow-2xl">
      {/* Mobile Status Bar */}
      <div className="w-full flex items-center justify-between text-[#18231F] text-xs font-semibold px-6 pt-3 opacity-80 shrink-0">
        <span className="font-mono text-[13px] tracking-tight">9:41</span>
        <div className="flex items-center gap-1.5 text-[#18231F]">
          <div className="flex items-end gap-0.5 h-3">
            <span className="w-0.5 h-1 bg-[#18231F] rounded-full" />
            <span className="w-0.5 h-1.5 bg-[#18231F] rounded-full" />
            <span className="w-0.5 h-2 bg-[#18231F] rounded-full" />
            <span className="w-0.5 h-3 bg-[#18231F] rounded-full" />
          </div>
          <Wifi className="w-3.5 h-3.5" />
          <Battery className="w-4 h-4" />
        </div>
      </div>

      {/* Top Header: Logo, Tinder-Style Segment Bars & Skip */}
      <div className="w-full px-6 pt-2 pb-1 shrink-0 space-y-2.5">
        <div className="flex items-center justify-between">
          <LumaLogo size={28} showWordmark={true} />

          {currentStep < screens.length - 1 && !isIndexing && (
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => {
                setDirection(1);
                setCurrentStep(screens.length - 1);
              }}
              className="text-xs font-bold text-[#737B75] hover:text-[#18231F] px-3 py-1 rounded-xl hover:bg-white/80 transition-all cursor-pointer"
            >
              Skip
            </motion.button>
          )}
        </div>

        {/* Tinder-Style Segmented Progress Bars */}
        <div className="grid grid-cols-4 gap-1.5 w-full pt-1">
          {screens.map((_, i) => (
            <div
              key={i}
              onClick={() => {
                if (!isIndexing) {
                  setDirection(i > currentStep ? 1 : -1);
                  setCurrentStep(i);
                }
              }}
              className="h-1 bg-[#E6E9E2] rounded-full overflow-hidden cursor-pointer"
            >
              <motion.div
                className="h-full bg-[#244D3F] rounded-full"
                initial={false}
                animate={{
                  width: i <= currentStep ? '100%' : '0%',
                }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area with Swipe Detection */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={(_, info) => {
          if (info.offset.x < -40 && currentStep < screens.length - 1) {
            handleNext();
          } else if (info.offset.x > 40 && currentStep > 0) {
            handlePrev();
          }
        }}
        className="w-full px-5 my-auto overflow-hidden touch-pan-y"
      >
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="w-full space-y-3.5"
          >
            {/* Visual Card Stage */}
            <div className="w-full">
              {active.component}
            </div>

            {/* Editorial Copy */}
            <div className="space-y-1.5 text-left px-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#244D3F] bg-[#DCE8B0]/60 px-2.5 py-0.5 rounded-full">
                {active.tag}
              </span>
              <h2 className="text-2xl font-extrabold tracking-tight text-[#18231F] leading-tight">
                {active.title}
              </h2>
              <p className="text-xs text-[#737B75] leading-relaxed">
                {active.subtitle}
              </p>
            </div>

            {/* Indexing Progress Bar Modal Overlay */}
            {isIndexing && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3.5 bg-white rounded-2xl border border-[#E6E9E2] space-y-2 shadow-sm"
              >
                <div className="flex items-center justify-between text-xs font-bold text-[#244D3F]">
                  <span className="flex items-center gap-2">
                    <FolderSync className="w-4 h-4 animate-spin text-[#2D8060]" />
                    <span>Indexing gallery photos...</span>
                  </span>
                  <span className="font-mono tabular-nums">{indexedCount} found</span>
                </div>
                <div className="w-full bg-[#E6E9E2] h-1.5 rounded-full overflow-hidden">
                  <motion.div
                    className="bg-[#244D3F] h-full rounded-full"
                    style={{ width: `${Math.min((indexedCount / 13) * 100, 100)}%` }}
                  />
                </div>
              </motion.div>
            )}

            {/* Bottom Reassurance Badge */}
            <div className="text-[11px] text-[#737B75] flex items-center gap-1.5 bg-white/90 py-1.5 px-3 rounded-xl border border-[#E6E9E2] shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-[#2D8060] shrink-0" />
              <span className="truncate">{active.footer}</span>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Bottom Navigation & CTAs */}
      <div className="w-full px-5 pt-2 pb-4 shrink-0 space-y-3">
        <div className="flex items-center gap-2.5">
          {currentStep > 0 && !isIndexing && (
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.94 }}
              onClick={handlePrev}
              className="min-h-[48px] px-4 rounded-2xl border border-[#E6E9E2] bg-white text-[#18231F] font-semibold text-xs hover:bg-[#F8F7F3] transition-all flex items-center justify-center cursor-pointer shadow-xs"
              aria-label="Previous step"
            >
              <ArrowLeft className="w-4 h-4" />
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleNext}
            disabled={isIndexing}
            className="flex-1 min-h-[48px] py-3.5 px-6 bg-[#244D3F] hover:bg-[#18231F] text-white font-bold text-sm rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
          >
            {isIndexing ? (
              <span>Opening Camera Roll...</span>
            ) : currentStep === screens.length - 1 ? (
              <>
                <span>Access Gallery & Begin</span>
                <Camera className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </motion.button>
        </div>

        {/* Bottom Home Indicator Bar */}
        <div className="w-full flex justify-center pt-1">
          <div className="w-32 h-1 bg-[#18231F]/25 rounded-full" />
        </div>
      </div>
    </div>
  );
};
