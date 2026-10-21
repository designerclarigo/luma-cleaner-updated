import React from 'react';
import { LumaLogo } from '../brand/LumaLogo';
import { Upload } from 'lucide-react';

interface HeaderProps {
  onImportMedia: () => void;
  onOpenSettings?: () => void;
  activeTab?: string;
  // Optional backwards compatibility if passed from parent
  onOpenVerification?: () => void;
  isMobileFrame?: boolean;
  onToggleMobileFrame?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onImportMedia,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-[#F8F7F3]/95 backdrop-blur-md border-b border-[#E6E9E2] px-3.5 sm:px-5 py-3 transition-colors">
      <div className="flex items-center justify-between gap-2 max-w-full">
        {/* Brand Logo & Wordmark - Responsive and vertically aligned */}
        <div className="flex items-center min-w-0 shrink">
          <LumaLogo size={32} showWordmark={true} className="select-none" />
        </div>

        {/* Action Controls: Import Media */}
        <div className="flex items-center shrink-0">
          {/* Import Media Button - fully responsive & cleanly aligned */}
          <button
            onClick={onImportMedia}
            className="min-h-[38px] sm:min-h-[40px] px-3.5 sm:px-4 py-1.5 inline-flex items-center justify-center gap-1.5 sm:gap-2 text-xs font-bold text-[#244D3F] bg-white hover:bg-[#F8F7F3] border border-[#244D3F]/25 hover:border-[#244D3F] rounded-xl sm:rounded-2xl shadow-2xs transition-all active:scale-97 cursor-pointer"
            title="Import personal photos or videos to clean"
            aria-label="Import Media"
          >
            <Upload className="w-3.5 h-3.5 text-[#2D8060] shrink-0" />
            <span className="whitespace-nowrap text-[11px] sm:text-xs">
              <span className="inline sm:hidden">Import</span>
              <span className="hidden sm:inline">Import Media</span>
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
