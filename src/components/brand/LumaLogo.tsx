import React from 'react';

interface LumaLogoProps {
  size?: number;
  className?: string;
  showWordmark?: boolean;
  inverted?: boolean;
}

export const LumaLogo: React.FC<LumaLogoProps> = ({
  size = 32,
  className = '',
  showWordmark = true,
  inverted = false,
}) => {
  const primaryColor = inverted ? '#F8F7F3' : '#244D3F';
  const accentColor = inverted ? '#DCE8B0' : '#2D8060';
  const lightRayColor = inverted ? '#DCE8B0' : '#DCE8B0';

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        {/* Ambient glow in background */}
        <circle cx="28" cy="18" r="14" fill={lightRayColor} fillOpacity="0.35" />

        {/* Minimal rounded photo frame with intentional opening in the top-right */}
        {/* Main continuous frame body with gentle rounded corners */}
        <path
          d="M 28 6 H 14 C 9.58 6 6 9.58 6 14 V 34 C 6 38.42 9.58 42 14 42 H 34 C 38.42 42 42 38.42 42 34 V 20"
          stroke={primaryColor}
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Light opening accent: soft angled ray of light emerging from the frame aperture */}
        <path
          d="M 28 6 L 42 20"
          stroke={accentColor}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="1 5"
        />

        {/* Interior focal point - subtle serene circle representing memory / lens */}
        <circle
          cx="22"
          cy="26"
          r="6"
          stroke={primaryColor}
          strokeWidth="2.5"
        />
        <circle
          cx="24"
          cy="24"
          r="2.5"
          fill={accentColor}
        />
      </svg>

      {showWordmark && (
        <div className="flex flex-col leading-none select-none">
          <span
            className="text-base sm:text-lg font-extrabold tracking-tight"
            style={{ color: inverted ? '#FFFFFF' : '#18231F' }}
          >
            Luma
          </span>
          <span
            className="text-[9px] sm:text-[10px] tracking-wider uppercase font-semibold mt-0.5 whitespace-nowrap"
            style={{ color: inverted ? '#DCE8B0' : '#737B75' }}
          >
            Gallery Cleaner
          </span>
        </div>
      )}
    </div>
  );
};
