import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Check,
  Trash2,
  Heart,
  Sparkles,
  Camera,
  Coffee,
  Receipt,
  EyeOff,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';

/* -------------------------------------------------------------------------- */
/* SCENE 1: “Your memories. Less clutter.”                                    */
/* Scattered photos smoothly organize into a card stack                       */
/* -------------------------------------------------------------------------- */
export const MemoriesOrganizeCardScene: React.FC = () => {
  const [isStacked, setIsStacked] = useState(false);

  useEffect(() => {
    // Snap from scattered to stacked after 400ms, then can be toggled
    const t = setTimeout(() => setIsStacked(true), 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative w-full h-[330px] flex items-center justify-center select-none overflow-hidden rounded-3xl bg-gradient-to-b from-[#F2F0E8] via-[#F8F7F3] to-[#F8F7F3] border border-[#E6E9E2] shadow-sm">
      {/* Soft radiant ambient glow */}
      <motion.div
        animate={{
          scale: isStacked ? 1.3 : 1,
          opacity: isStacked ? 0.6 : 0.3,
        }}
        transition={{ duration: 0.8 }}
        className="absolute w-64 h-64 rounded-full bg-[#DCE8B0]/40 blur-3xl pointer-events-none"
      />

      {/* Scattered to Stacked Photo Cards */}

      {/* Card 4: Background Card (Dog in Park) */}
      <motion.div
        initial={{ x: -90, y: -50, rotate: -22, opacity: 0.8 }}
        animate={
          isStacked
            ? { x: 0, y: 16, rotate: 6, opacity: 0.7, scale: 0.88 }
            : { x: -85, y: -45, rotate: -18, opacity: 0.9, scale: 0.95 }
        }
        transition={{ type: 'spring', damping: 18, stiffness: 220 }}
        className="absolute z-10 w-52 h-44 rounded-3xl bg-white border border-[#E6E9E2] p-2 shadow-md flex flex-col justify-between overflow-hidden"
      >
        <img
          src="https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=400&q=70"
          alt=""
          className="w-full h-28 object-cover rounded-2xl bg-slate-100"
        />
        <div className="flex items-center justify-between text-[11px] font-bold text-[#737B75] px-1">
          <span>PuppyPark.jpg</span>
          <span className="tabular-nums">3.9 MB</span>
        </div>
      </motion.div>

      {/* Card 3: Duplicate coffee shot */}
      <motion.div
        initial={{ x: 95, y: -40, rotate: 24, opacity: 0.8 }}
        animate={
          isStacked
            ? { x: 0, y: 8, rotate: -4, opacity: 0.85, scale: 0.94 }
            : { x: 88, y: -38, rotate: 19, opacity: 0.9, scale: 0.95 }
        }
        transition={{ type: 'spring', damping: 18, stiffness: 220, delay: 0.05 }}
        className="absolute z-20 w-52 h-44 rounded-3xl bg-white border border-[#E6E9E2] p-2 shadow-lg flex flex-col justify-between overflow-hidden"
      >
        <div className="relative w-full h-28 rounded-2xl overflow-hidden bg-slate-100">
          <img
            src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=400&q=70"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute top-1.5 right-1.5 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
            Burst #3
          </div>
        </div>
        <div className="flex items-center justify-between text-[11px] font-bold text-[#737B75] px-1">
          <span>CoffeeArt.jpg</span>
          <span className="tabular-nums">3.1 MB</span>
        </div>
      </motion.div>

      {/* Card 2: Receipt Screenshot */}
      <motion.div
        initial={{ x: -75, y: 55, rotate: -14, opacity: 0.8 }}
        animate={
          isStacked
            ? { x: 0, y: 0, rotate: 2, opacity: 0.95, scale: 0.98 }
            : { x: -68, y: 50, rotate: -10, opacity: 0.95, scale: 0.95 }
        }
        transition={{ type: 'spring', damping: 18, stiffness: 220, delay: 0.1 }}
        className="absolute z-20 w-52 h-44 rounded-3xl bg-white border border-[#E6E9E2] p-2 shadow-lg flex flex-col justify-between overflow-hidden"
      >
        <div className="w-full h-28 rounded-2xl bg-gray-50 border border-gray-200 flex flex-col items-center justify-center">
          <Receipt className="w-6 h-6 text-gray-400 mb-1" />
          <span className="text-[10px] font-mono text-gray-600 font-bold">$42.80 Grocery.png</span>
        </div>
        <div className="flex items-center justify-between text-[11px] font-bold text-[#737B75] px-1">
          <span>Screenshot</span>
          <span className="tabular-nums">1.8 MB</span>
        </div>
      </motion.div>

      {/* Card 1: Top Golden Memory Card (Yosemite Landscape) */}
      <motion.div
        initial={{ x: 0, y: 0, scale: 0.9, opacity: 0 }}
        animate={
          isStacked
            ? { x: 0, y: -4, rotate: 0, scale: 1.02, opacity: 1 }
            : { x: 10, y: -10, rotate: -3, scale: 1, opacity: 1 }
        }
        transition={{ type: 'spring', damping: 16, stiffness: 240, delay: 0.15 }}
        className="relative z-30 w-56 h-48 rounded-3xl bg-white border-2 border-[#244D3F] p-2.5 shadow-2xl flex flex-col justify-between overflow-hidden"
      >
        <div className="relative w-full h-32 rounded-2xl overflow-hidden bg-slate-100">
          <img
            src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 right-2 bg-[#244D3F] text-[#DCE8B0] text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
            <Heart className="w-3 h-3 fill-current" />
            <span>Cherished</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs font-bold text-[#18231F] px-1">
          <span>YosemiteMist.jpg</span>
          <span className="text-[#2D8060] tabular-nums">4.2 MB</span>
        </div>
      </motion.div>

      {/* Interactive Trigger Button at Bottom of Visual Stage */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsStacked(!isStacked)}
        className="absolute bottom-3.5 z-40 px-4 py-1.5 bg-[#18231F] text-white hover:bg-[#244D3F] rounded-full text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
      >
        <Sparkles className="w-3.5 h-3.5 text-[#DCE8B0]" />
        <span>{isStacked ? 'See Scattered Chaos' : 'Snap Into Deck'}</span>
      </motion.button>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* SCENE 2: “Swipe. Keep. Clear.”                                             */
/* Demonstrate right-to-keep and left-to-delete with animated labels           */
/* -------------------------------------------------------------------------- */
export const SwipeKeepClearCardScene: React.FC = () => {
  const [dragX, setDragX] = useState(0);
  const [lastAction, setLastAction] = useState<'keep' | 'delete' | null>(null);

  // Auto demonstration preview: tilts right, then tilts left if user doesn't touch
  useEffect(() => {
    const t1 = setTimeout(() => {
      if (dragX === 0) setDragX(65);
    }, 700);
    const t2 = setTimeout(() => {
      if (dragX === 65) setDragX(-65);
    }, 1800);
    const t3 = setTimeout(() => {
      if (dragX === -65) setDragX(0);
    }, 2800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  const keepOpacity = Math.min(Math.max((dragX - 10) / 40, 0), 1);
  const deleteOpacity = Math.min(Math.max((-dragX - 10) / 40, 0), 1);

  const handleSimulateSwipe = (type: 'keep' | 'delete') => {
    if (type === 'keep') {
      setDragX(90);
      setLastAction('keep');
      setTimeout(() => setDragX(0), 700);
    } else {
      setDragX(-90);
      setLastAction('delete');
      setTimeout(() => setDragX(0), 700);
    }
  };

  return (
    <div className="relative w-full h-[330px] flex flex-col items-center justify-center select-none overflow-hidden rounded-3xl bg-gradient-to-b from-[#F2F0E8] via-[#F8F7F3] to-[#F8F7F3] border border-[#E6E9E2] shadow-sm touch-none">
      {/* Directional Guides at Top */}
      <div className="absolute inset-x-5 top-4 flex items-center justify-between text-[11px] font-extrabold tracking-wide pointer-events-none z-30">
        <span className="text-[#C86462] flex items-center gap-1 bg-red-50/90 px-2.5 py-1 rounded-xl border border-red-200 shadow-2xs">
          <Trash2 className="w-3.5 h-3.5" /> SWIPE LEFT TO DELETE
        </span>
        <span className="text-[#2D8060] flex items-center gap-1 bg-emerald-50/90 px-2.5 py-1 rounded-xl border border-emerald-200 shadow-2xs">
          SWIPE RIGHT TO KEEP <Check className="w-3.5 h-3.5 stroke-[3]" />
        </span>
      </div>

      {/* Underneath Next Card in Deck */}
      <div
        className="absolute w-52 h-44 bg-[#F8F7F3] rounded-3xl border border-[#E6E9E2] shadow-sm p-2 flex flex-col justify-between pointer-events-none"
        style={{
          transform: 'scale(0.92) translateY(14px)',
          opacity: 0.75,
        }}
      >
        <img
          src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=70"
          alt=""
          className="w-full h-28 object-cover rounded-2xl bg-slate-200"
        />
        <div className="text-xs text-[#737B75] text-center font-bold">Up Next</div>
      </div>

      {/* Interactive Swipable Top Card */}
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
          x: dragX,
          rotate: dragX * 0.12,
        }}
        transition={{ type: 'spring', damping: 20, stiffness: 260 }}
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
            alt=""
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex items-center justify-between text-xs font-bold text-[#18231F] px-1">
          <span>PineFog.jpg</span>
          <span className="font-mono text-[#244D3F]">5.1 MB</span>
        </div>
      </motion.div>

      {/* Tactile Tinder-Style Bottom Action Buttons */}
      <div className="absolute bottom-3 z-30 flex items-center gap-4">
        {/* Red Discard Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.88 }}
          onClick={() => handleSimulateSwipe('delete')}
          className="w-11 h-11 rounded-full bg-white border-2 border-[#C86462]/30 text-[#C86462] flex items-center justify-center shadow-md hover:bg-red-50 cursor-pointer"
          title="Swipe Left / Discard"
        >
          <Trash2 className="w-5 h-5 stroke-[2.2]" />
        </motion.button>

        <span className="text-[11px] font-bold text-[#737B75] bg-white/80 px-3 py-1 rounded-full border border-[#E6E9E2]">
          Drag or tap buttons
        </span>

        {/* Green Keep Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.88 }}
          onClick={() => handleSimulateSwipe('keep')}
          className="w-11 h-11 rounded-full bg-[#2D8060] text-white flex items-center justify-center shadow-md hover:bg-[#244D3F] cursor-pointer"
          title="Swipe Right / Keep"
        >
          <Check className="w-5 h-5 stroke-[3]" />
        </motion.button>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* SCENE 3: “Make room for what matters.”                                     */
/* Unwanted cards move away while favorite memories remain                   */
/* -------------------------------------------------------------------------- */
export const MakeRoomCardScene: React.FC = () => {
  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setCleared(true), 1200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative w-full h-[330px] flex flex-col items-center justify-center select-none overflow-hidden rounded-3xl bg-gradient-to-b from-[#F2F0E8] via-[#F8F7F3] to-[#F8F7F3] border border-[#E6E9E2] shadow-sm">
      {/* Radiant Aura */}
      <motion.div
        animate={{
          scale: cleared ? [1.1, 1.4, 1.3] : 1,
          opacity: cleared ? 0.65 : 0.25,
        }}
        transition={{ duration: 1.2, repeat: cleared ? Infinity : 0, repeatDelay: 1 }}
        className="absolute w-60 h-60 rounded-full bg-[#DCE8B0] blur-3xl pointer-events-none"
      />

      {/* Top Reclaimed Banner Tag */}
      <div className="absolute top-4 inset-x-5 flex items-center justify-between z-30 pointer-events-none">
        <span className="text-[11px] font-bold text-[#737B75] uppercase tracking-wider bg-white/80 px-2.5 py-1 rounded-full border border-[#E6E9E2]">
          Clean Library Result
        </span>
        <motion.span
          animate={{
            scale: cleared ? [0.95, 1.08, 1] : 1,
          }}
          transition={{ duration: 0.4 }}
          className="text-[11px] font-bold bg-[#2D8060] text-white px-3 py-1 rounded-full shadow-xs flex items-center gap-1"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>+6.8 GB Free Space</span>
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
            alt=""
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
            ? { x: -220, y: -120, rotate: -35, opacity: 0, scale: 0.5 }
            : { x: -65, y: -25, rotate: -10, opacity: 0.95 }
        }
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="absolute z-20 w-44 h-34 rounded-2xl bg-white border border-red-200 p-2.5 shadow-lg flex flex-col justify-between pointer-events-none"
      >
        <div className="w-full h-20 rounded-xl bg-red-50/80 flex flex-col items-center justify-center border border-dashed border-red-200">
          <EyeOff className="w-6 h-6 text-[#C86462] mb-1" />
          <span className="text-[10px] text-[#C86462] font-bold">Blurry accidental shot</span>
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
            ? { x: 220, y: -110, rotate: 35, opacity: 0, scale: 0.5 }
            : { x: 65, y: -28, rotate: 10, opacity: 0.95 }
        }
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        className="absolute z-20 w-44 h-34 rounded-2xl bg-white border border-gray-200 p-2.5 shadow-lg flex flex-col justify-between pointer-events-none"
      >
        <div className="w-full h-20 rounded-xl bg-gray-50 flex flex-col items-center justify-center border border-gray-200">
          <Receipt className="w-6 h-6 text-gray-400 mb-1" />
          <span className="text-[10px] font-mono text-gray-700 font-bold">$38.50 Receipt.png</span>
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
            ? { y: 220, opacity: 0, scale: 0.5 }
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
        <span>{cleared ? 'Show Clutter Moving Out' : 'Simulate Clearing'}</span>
      </motion.button>
    </div>
  );
};
