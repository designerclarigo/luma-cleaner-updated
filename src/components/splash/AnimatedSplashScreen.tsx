import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Wifi, Battery } from 'lucide-react';

interface AnimatedSplashScreenProps {
  onFinish: () => void;
  autoDismissMs?: number;
  reducedMotion?: boolean;
}

export const AnimatedSplashScreen: React.FC<AnimatedSplashScreenProps> = ({
  onFinish,
  autoDismissMs = 1900,
  reducedMotion = false,
}) => {
  const [isDismissing, setIsDismissing] = useState(false);

  // Check prefers-reduced-motion media query or prop
  const prefersReduced = useMemo(() => {
    if (reducedMotion) return true;
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  }, [reducedMotion]);

  useEffect(() => {
    const dismissTime = prefersReduced ? 900 : autoDismissMs - 320;
    const finishTime = prefersReduced ? 1100 : autoDismissMs;

    const tDismiss = setTimeout(() => setIsDismissing(true), dismissTime);
    const tFinish = setTimeout(() => onFinish(), finishTime);

    return () => {
      clearTimeout(tDismiss);
      clearTimeout(tFinish);
    };
  }, [onFinish, autoDismissMs, prefersReduced]);

  const handleSkip = () => {
    setIsDismissing(true);
    setTimeout(onFinish, 120);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{
        opacity: isDismissing ? 0 : 1,
        scale: isDismissing ? 1.015 : 1,
      }}
      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
      onClick={handleSkip}
      className="fixed inset-0 z-50 bg-[#18231F]/30 backdrop-blur-sm flex items-center justify-center p-0 sm:p-4 select-none cursor-pointer overflow-hidden"
      aria-label="Luma launch screen - tap anywhere to skip"
    >
      {/* Mobile Device Frame Container for consistent presentation across desktop & mobile */}
      <div className="w-full max-w-md h-full sm:h-[844px] sm:max-h-[94vh] sm:rounded-[44px] sm:border-[6px] sm:border-[#244D3F]/15 bg-[#F8F7F3] shadow-2xl relative overflow-hidden flex flex-col justify-between items-center">
        {/* 1. PICOSO-INSPIRED ORGANIC MESH GRADIENT BACKGROUND */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Base warm ivory background */}
          <div className="absolute inset-0 bg-[#F8F7F3]" />

          {/* Dynamic Mesh Blob 1: Deep Forest Green (Top Left) */}
          <motion.div
            animate={
              prefersReduced
                ? { opacity: 0.32 }
                : {
                    x: [-20, 24, -12, -20],
                    y: [-16, 18, -8, -16],
                    scale: [0.95, 1.15, 1.02, 0.95],
                    opacity: [0.28, 0.42, 0.35, 0.28],
                  }
            }
            transition={{
              duration: 5.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute -top-24 -left-20 w-[360px] h-[360px] rounded-full blur-[80px]"
            style={{
              background:
                'radial-gradient(circle, rgba(36, 77, 63, 0.45) 0%, rgba(36, 77, 63, 0.12) 55%, transparent 75%)',
            }}
          />

          {/* Dynamic Mesh Blob 2: Radiant Mint / Lime Light (Top Right) */}
          <motion.div
            animate={
              prefersReduced
                ? { opacity: 0.55 }
                : {
                    x: [15, -22, 10, 15],
                    y: [-12, 22, -6, -12],
                    scale: [1, 1.2, 1.06, 1],
                    opacity: [0.45, 0.72, 0.58, 0.45],
                  }
            }
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.3,
            }}
            className="absolute -top-16 -right-20 w-[400px] h-[400px] rounded-full blur-[75px]"
            style={{
              background:
                'radial-gradient(circle, rgba(220, 232, 176, 0.85) 0%, rgba(220, 232, 176, 0.3) 50%, transparent 75%)',
            }}
          />

          {/* Dynamic Mesh Blob 3: Rich Sage & Emerald (Bottom Center-Right) */}
          <motion.div
            animate={
              prefersReduced
                ? { opacity: 0.25 }
                : {
                    x: [-18, 16, -10, -18],
                    y: [14, -18, 8, 14],
                    scale: [0.92, 1.14, 1, 0.92],
                    opacity: [0.22, 0.38, 0.3, 0.22],
                  }
            }
            transition={{
              duration: 6.8,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.6,
            }}
            className="absolute -bottom-28 right-0 w-[420px] h-[420px] rounded-full blur-[90px]"
            style={{
              background:
                'radial-gradient(circle, rgba(45, 128, 96, 0.4) 0%, rgba(45, 128, 96, 0.12) 60%, transparent 80%)',
            }}
          />

          {/* Subtle Ambient Pearl Highlight (Center Stage) */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] rounded-full blur-[65px] opacity-75 pointer-events-none"
            style={{
              background:
                'radial-gradient(circle, rgba(255, 255, 255, 0.92) 0%, rgba(248, 247, 243, 0.4) 50%, transparent 75%)',
            }}
          />

          {/* Tactile Micro-Grain Paper Texture Overlay */}
          <div
            className="absolute inset-0 opacity-[0.035] mix-blend-overlay pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            }}
          />
        </div>

        {/* Top Mobile Status Bar */}
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 0.85, y: 0 }}
          transition={{ delay: 0.05, duration: 0.3 }}
          className="w-full flex items-center justify-between text-[#18231F] text-xs font-semibold px-6 pt-3.5 z-20 shrink-0"
        >
          <span className="font-mono text-[13px] tracking-tight font-bold">9:41</span>
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
        </motion.div>

        {/* CENTERPIECE: PERFECTLY ARRANGED LUMA LOGO & TYPOGRAPHY LOCKUP */}
        <div className="flex-1 w-full flex flex-col items-center justify-center px-6 relative z-10 select-none">
          {/* LOGO STAGE WITH ASSEMBLING PHOTO FRAMES & HALO */}
          <div className="relative w-48 h-48 flex items-center justify-center mb-6">
            {/* RESTRAINED LIGHT HALO: Mint Aura behind logo aperture */}
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={
                prefersReduced
                  ? { scale: 1, opacity: 0.65 }
                  : {
                      scale: [0.65, 1.35, 1.15],
                      opacity: [0, 0.85, 0.65],
                    }
              }
              transition={{
                delay: 0.25,
                duration: 1.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="absolute w-44 h-44 rounded-full pointer-events-none blur-2xl"
              style={{
                background:
                  'radial-gradient(circle, rgba(220, 232, 176, 0.8) 0%, rgba(45, 128, 96, 0.28) 45%, transparent 70%)',
              }}
            />

            {/* SECONDARY EMERALD GLOW HALO */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={
                prefersReduced
                  ? { scale: 1, opacity: 0.3 }
                  : {
                      scale: [0.5, 1.25, 1.05],
                      opacity: [0, 0.45, 0.3],
                    }
              }
              transition={{
                delay: 0.35,
                duration: 1.0,
                ease: 'easeOut',
              }}
              className="absolute w-36 h-36 rounded-full pointer-events-none blur-xl"
              style={{
                background:
                  'radial-gradient(circle, rgba(45, 128, 96, 0.5) 0%, transparent 65%)',
              }}
            />

            {/* 2. SUBTLE PHOTO-FRAME OUTLINES CONVERGING & ASSEMBLING INTO LOGO */}
            {!prefersReduced && (
              <>
                {/* Frame 1: Landscape photo outline sliding in from top-left */}
                <motion.div
                  initial={{
                    x: -54,
                    y: -44,
                    rotate: -14,
                    scale: 0.85,
                    opacity: 0,
                  }}
                  animate={{
                    x: [-54, -10, 0],
                    y: [-44, -6, 0],
                    rotate: [-14, -3, 0],
                    scale: [0.85, 0.98, 1],
                    opacity: [0, 0.75, 0],
                  }}
                  transition={{
                    duration: 0.55,
                    delay: 0.08,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="absolute w-28 h-22 rounded-2xl border-1.5 border-[#244D3F]/35 bg-white/20 backdrop-blur-xs pointer-events-none shadow-xs"
                />

                {/* Frame 2: Portrait photo outline sliding in from bottom-right */}
                <motion.div
                  initial={{
                    x: 52,
                    y: 46,
                    rotate: 15,
                    scale: 0.85,
                    opacity: 0,
                  }}
                  animate={{
                    x: [52, 10, 0],
                    y: [46, 6, 0],
                    rotate: [15, 3, 0],
                    scale: [0.85, 0.98, 1],
                    opacity: [0, 0.75, 0],
                  }}
                  transition={{
                    duration: 0.58,
                    delay: 0.12,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="absolute w-22 h-28 rounded-2xl border-1.5 border-[#2D8060]/40 bg-[#DCE8B0]/20 backdrop-blur-xs pointer-events-none shadow-xs"
                />

                {/* Frame 3: Center focus viewfinder reticle converging */}
                <motion.div
                  initial={{
                    scale: 1.3,
                    rotate: -6,
                    opacity: 0,
                  }}
                  animate={{
                    scale: [1.3, 1.04, 1],
                    rotate: [-6, 1, 0],
                    opacity: [0, 0.6, 0],
                  }}
                  transition={{
                    duration: 0.5,
                    delay: 0.18,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="absolute w-28 h-28 rounded-3xl border border-[#DCE8B0] bg-white/30 pointer-events-none"
                />
              </>
            )}

            {/* 3. ASSEMBLED LUMA LOGO SQUIRCLE EMBLEM */}
            <motion.div
              initial={
                prefersReduced
                  ? { opacity: 0 }
                  : { scale: 0.72, opacity: 0, y: 16 }
              }
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{
                type: 'spring',
                damping: 14,
                stiffness: 220,
                delay: prefersReduced ? 0.05 : 0.28,
              }}
              className="relative z-10 w-28 h-28 sm:w-32 sm:h-32 bg-white/90 backdrop-blur-md rounded-3xl sm:rounded-[32px] border border-[#244D3F]/15 shadow-[0_18px_40px_-10px_rgba(24,35,31,0.16)] flex items-center justify-center p-3"
            >
              {/* Luminous Aperture Light Flare positioned at aperture opening */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={
                  prefersReduced
                    ? { scale: 1, opacity: 0.6 }
                    : {
                        scale: [0, 1.4, 1.05],
                        opacity: [0, 0.95, 0.7],
                      }
                }
                transition={{
                  delay: 0.44,
                  duration: 0.7,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="absolute top-3 right-3 w-10 h-10 rounded-full pointer-events-none blur-md"
                style={{
                  background:
                    'radial-gradient(circle, rgba(255, 255, 255, 0.95) 0%, rgba(220, 232, 176, 0.85) 45%, transparent 75%)',
                }}
              />

              {/* Canonical Luma Logo SVG (Exact proportions & geometry aligned with LumaLogo.tsx) */}
              <svg
                width="72"
                height="72"
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="transform drop-shadow-xs"
              >
                {/* Aperture ambient aura */}
                <motion.circle
                  cx="28"
                  cy="18"
                  r="14"
                  fill="#DCE8B0"
                  initial={{ fillOpacity: 0, scale: 0.5 }}
                  animate={{ fillOpacity: 0.38, scale: 1 }}
                  transition={{
                    delay: prefersReduced ? 0.05 : 0.32,
                    duration: 0.5,
                    ease: 'easeOut',
                  }}
                />

                {/* Continuous rounded photo frame path animated draw */}
                <motion.path
                  d="M 28 6 H 14 C 9.58 6 6 9.58 6 14 V 34 C 6 38.42 9.58 42 14 42 H 34 C 38.42 42 42 38.42 42 34 V 20"
                  stroke="#244D3F"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={prefersReduced ? { pathLength: 1 } : { pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{
                    duration: 0.62,
                    ease: [0.16, 1, 0.3, 1],
                    delay: prefersReduced ? 0 : 0.28,
                  }}
                />

                {/* Aperture light ray emerging through the top-right frame opening */}
                <motion.path
                  d="M 28 6 L 42 20"
                  stroke="#2D8060"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray="1 5"
                  initial={
                    prefersReduced ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }
                  }
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{
                    delay: prefersReduced ? 0.05 : 0.44,
                    duration: 0.42,
                    ease: 'easeOut',
                  }}
                />

                {/* Center memory lens ring */}
                <motion.circle
                  cx="22"
                  cy="26"
                  r="6"
                  stroke="#244D3F"
                  strokeWidth="2.5"
                  initial={prefersReduced ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    delay: prefersReduced ? 0.05 : 0.38,
                    duration: 0.45,
                    type: 'spring',
                    damping: 14,
                  }}
                />

                {/* Center lens glint (Exact coordinates cx=24, cy=24 matching LumaLogo) */}
                <motion.circle
                  cx="24"
                  cy="24"
                  r="2.5"
                  fill="#2D8060"
                  initial={prefersReduced ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                  animate={{ scale: [0, 1.35, 1], opacity: [0, 1, 1] }}
                  transition={{
                    delay: prefersReduced ? 0.05 : 0.5,
                    duration: 0.35,
                    ease: 'backOut',
                  }}
                />
              </svg>
            </motion.div>
          </div>

          {/* 4. WORDMARK & TAGLINE REVEAL (Harmoniously spaced & arranged) */}
          <div className="flex flex-col items-center justify-center text-center">
            {/* Wordmark Letter Stagger: "Luma" */}
            <div className="flex items-center justify-center gap-0.5 overflow-hidden">
              {'Luma'.split('').map((char, index) => (
                <motion.span
                  key={index}
                  initial={
                    prefersReduced
                      ? { opacity: 0 }
                      : { y: 22, opacity: 0, filter: 'blur(5px)' }
                  }
                  animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                  transition={{
                    delay: prefersReduced ? 0.1 : 0.36 + index * 0.05,
                    duration: 0.42,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="text-4xl sm:text-[42px] font-extrabold tracking-tight text-[#18231F] leading-none"
                >
                  {char}
                </motion.span>
              ))}
            </div>

            {/* Tagline: "Make room for memories" */}
            <motion.div
              initial={
                prefersReduced
                  ? { opacity: 0 }
                  : { opacity: 0, y: 8 }
              }
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: prefersReduced ? 0.15 : 0.6,
                duration: 0.45,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="mt-2.5"
            >
              <p className="text-[11px] sm:text-xs tracking-[0.24em] uppercase font-bold text-[#55685F]">
                Make room for memories
              </p>
            </motion.div>

            {/* Subtle Brand Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: prefersReduced ? 0.2 : 0.72,
                duration: 0.4,
                ease: 'easeOut',
              }}
              className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#244D3F]/6 border border-[#244D3F]/12 text-[10px] font-semibold text-[#244D3F]"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#2D8060]" />
              <span>Gallery Cleaner · 100% Private</span>
            </motion.div>
          </div>
        </div>

        {/* Bottom Hint & Home Indicator Bar */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 0.75, y: 0 }}
          transition={{ delay: 0.75, duration: 0.35 }}
          className="w-full flex flex-col items-center gap-2 pb-5 z-20 shrink-0"
        >
          <span className="text-[10px] font-semibold text-[#737B75]/70 tracking-wider uppercase">
            Tap anywhere to continue
          </span>
          <div className="w-32 h-1 bg-[#18231F]/20 rounded-full" />
        </motion.div>
      </div>
    </motion.div>
  );
};
