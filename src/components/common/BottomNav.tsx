import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Bookmark, BarChart3, Settings } from 'lucide-react';

export type TabType = 'clean' | 'bookmarks' | 'insights' | 'settings';

interface BottomNavProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  bookmarkCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  bookmarkCount,
}) => {
  const tabs: { id: TabType; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'clean',
      label: 'Clean',
      icon: <Sparkles className="w-5 h-5" />,
    },
    {
      id: 'bookmarks',
      label: 'Bookmarks',
      icon: <Bookmark className="w-5 h-5" />,
      badge: bookmarkCount > 0 ? bookmarkCount : undefined,
    },
    {
      id: 'insights',
      label: 'Insights',
      icon: <BarChart3 className="w-5 h-5" />,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  const handleTabClick = (id: TabType) => {
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate?.(10);
      } catch {
        // ignore
      }
    }
    onChangeTab(id);
  };

  return (
    <nav className="sticky bottom-0 z-30 bg-white/95 backdrop-blur-md border-t border-[#E6E9E2] px-3 sm:px-6 py-1.5 pb-safe w-full transition-all shadow-[0_-4px_24px_rgba(24,35,31,0.04)] shrink-0 select-none">
      <div className="flex items-center justify-around h-14 max-w-md mx-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`relative min-h-[46px] min-w-[62px] sm:min-w-[72px] px-2 flex flex-col items-center justify-center transition-all active:scale-95 cursor-pointer ${
                isActive ? 'text-[#244D3F]' : 'text-[#737B75] hover:text-[#18231F]'
              }`}
            >
              {/* Animated Background Pill for Active Tab */}
              {isActive && (
                <motion.div
                  layoutId="activeTabPill"
                  className="absolute inset-0 bg-[#244D3F]/8 rounded-2xl -z-10"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}

              <div className="relative">
                {tab.icon}
                {tab.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-3 bg-amber-500 text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full min-w-[16px] text-center leading-tight shadow-xs">
                    {tab.badge}
                  </span>
                )}
              </div>

              <span
                className={`text-[11px] font-bold tracking-tight mt-1 transition-colors ${
                  isActive ? 'text-[#244D3F]' : 'text-[#737B75]'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
