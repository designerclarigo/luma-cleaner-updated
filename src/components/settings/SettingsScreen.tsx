import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppSettings } from '../../types/media';
import { mediaService, formatBytes } from '../../services/mediaService';
import {
  X,
  Shield,
  Vibrate,
  Eye,
  RotateCcw,
  HelpCircle,
  Check,
  AlertTriangle,
  Smartphone,
  CheckCircle2,
  Lock,
  Sparkles,
  Camera,
  Trash2,
  ChevronRight,
  ChevronDown,
  HardDrive,
  RefreshCw,
  User,
  ShieldCheck,
  FileText,
  Flame,
  Award,
  Layers,
  Edit2,
  Sliders,
  ArrowLeft,
  Search,
} from 'lucide-react';
import { LumaLogo } from '../brand/LumaLogo';

export type SettingsTab = 'general' | 'profile' | 'faq' | 'privacy';

interface SettingsScreenProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onClose: () => void;
  onResetAllData: () => void;
  onReplaySplash: () => void;
  onReplayOnboarding: () => void;
  isMobileFrame?: boolean;
  onToggleMobileFrame?: () => void;
  onOpenVerification?: () => void;
  initialTab?: SettingsTab;
  isInlineTab?: boolean;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settings,
  onUpdateSettings,
  onClose,
  onResetAllData,
  onReplaySplash,
  onReplayOnboarding,
  isMobileFrame,
  onToggleMobileFrame,
  onOpenVerification,
  initialTab = 'general',
  isInlineTab = false,
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [cacheCleared, setCacheCleared] = useState(false);

  // Profile editable state (persisted in localStorage)
  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem('luma_user_name') || 'Alex Rivers';
  });
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(userName);

  // FAQ search & open state
  const [faqSearch, setFaqSearch] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<string | null>('faq-1');

  // Stats from mediaService
  const stats = mediaService.getStats();
  const allMedia = mediaService.getAllMedia();
  const storage = mediaService.getStorageBreakdown();
  const healthScore = mediaService.getGalleryHealthScore();

  const handleSaveName = () => {
    const trimmed = tempName.trim();
    if (trimmed) {
      setUserName(trimmed);
      localStorage.setItem('luma_user_name', trimmed);
    }
    setIsEditingName(false);
  };

  const handleToggleHaptics = () => {
    onUpdateSettings({ hapticsEnabled: !settings.hapticsEnabled });
    if (!settings.hapticsEnabled && 'vibrate' in navigator) {
      navigator.vibrate?.(20);
    }
  };

  const handleToggleReducedMotion = () => {
    onUpdateSettings({ reducedMotion: !settings.reducedMotion });
  };

  const handleToggleReviewSafety = () => {
    onUpdateSettings({ showReviewBeforeFinish: !settings.showReviewBeforeFinish });
  };

  const handleCyclePermission = () => {
    window.alert('Use the native app. Photo permissions are managed by Android or iOS.');
  };

  const handleClearCache = () => {
    setCacheCleared(true);
    setTimeout(() => setCacheCleared(false), 2000);
  };

  // FAQ Items
  const faqList = [
    {
      id: 'faq-1',
      question: 'How does Tinder-style swiping work in Luma?',
      answer:
        'Swiping right marks a photo to KEEP, swiping left marks it for DELETION, and tapping the yellow button UNDOES your last swipe. An incomplete swipe smoothly returns to center using realistic spring physics. You can also use the bottom tactile buttons if you prefer tapping.',
    },
    {
      id: 'faq-2',
      question: 'Are my photos deleted immediately upon swiping left?',
      answer:
        'Never! Swiping left only stages media for review. Before any photo is permanently removed, you must tap "Review Deletions", inspect thumbnails, and confirm the native system deletion dialog.',
    },
    {
      id: 'faq-3',
      question: 'Are any photos or videos sent to external cloud servers?',
      answer:
        'Zero. Luma is built on an absolute 100% on-device architecture. All scanning, metadata extraction, thumbnail caching, and swipe decisions execute locally within your browser sandbox. No photo is ever uploaded.',
    },
    {
      id: 'faq-4',
      question: 'How does duplicate and burst photo detection work?',
      answer:
        'Luma analyzes capture timestamps, filename sequences (_01, _02, burst markers), and resolution on-device to group rapid photo bursts together so you keep only the sharpest memory and clear redundant clutter.',
    },
    {
      id: 'faq-5',
      question: 'Can I undo a swipe if I make a mistake?',
      answer:
        'Yes! Tap the yellow Undo button anytime during swiping to pull the previous photo back with its exact original decision restored. You can undo through your entire active session.',
    },
    {
      id: 'faq-6',
      question: 'How do I clean my own personal photos from my device?',
      answer:
        'Tap the "Import Media" button located in the top navigation bar. You can choose photos or videos from your camera roll or local files to clean them with private, local on-device processing.',
    },
    {
      id: 'faq-7',
      question: 'What is the bookmark feature for?',
      answer:
        'Tapping the Star or Bookmark button flags special photos into your Bookmarks collection. Bookmarked photos are highlighted and protected so you never accidentally mark them for deletion.',
    },
  ];

  const filteredFaqs = faqList.filter(
    (item) =>
      item.question.toLowerCase().includes(faqSearch.toLowerCase()) ||
      item.answer.toLowerCase().includes(faqSearch.toLowerCase())
  );

  const isInline = !!isInlineTab;

  const mainContent = (
    <div
      className={`w-full flex flex-col ${
        isInline
          ? 'bg-[#F8F7F3] min-h-full'
          : 'bg-white rounded-3xl max-h-[92vh] overflow-hidden shadow-2xl border border-[#E6E9E2]'
      }`}
    >
      {/* Top Header */}
      <div
        className={`p-4 border-b border-[#E6E9E2] flex items-center justify-between shrink-0 ${
          isInline
            ? 'bg-white/95 sticky top-0 z-20 backdrop-blur-md'
            : 'bg-[#F8F7F3]'
        }`}
      >
        <div className="flex items-center gap-2.5">
          {activeTab !== 'general' ? (
            <button
              onClick={() => setActiveTab('general')}
              className="w-8 h-8 rounded-full bg-white border border-[#E6E9E2] flex items-center justify-center text-[#244D3F] hover:bg-[#F8F7F3] transition-colors cursor-pointer mr-0.5"
              aria-label="Back to general settings"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          ) : (
            <LumaLogo size={26} showWordmark={false} />
          )}
          <div>
            <h2 className="text-base font-extrabold text-[#18231F] leading-tight capitalize">
              {activeTab === 'general'
                ? 'Settings'
                : activeTab === 'profile'
                ? 'My Profile'
                : activeTab === 'faq'
                ? 'Frequently Asked Questions'
                : 'Privacy Policy'}
            </h2>
            <span className="text-[10px] text-[#737B75] font-mono">
              {activeTab === 'general'
                ? 'Luma v2.4 · Forest Edition'
                : activeTab === 'profile'
                ? 'Curator Account & Stats'
                : activeTab === 'faq'
                ? 'Help Center & Safety Guide'
                : '100% On-Device Guarantee'}
            </span>
          </div>
        </div>
        {!isInline && (
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-[#E6E9E2] flex items-center justify-center text-[#737B75] hover:text-[#18231F] cursor-pointer"
            aria-label="Close settings"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Segmented Screen Switcher Bar */}
      <div
        className={`px-4 pt-3 pb-2 border-b border-[#E6E9E2] bg-white flex items-center justify-between gap-1 overflow-x-auto shrink-0 ${
          isInline ? 'sticky top-[61px] z-20 shadow-2xs' : ''
        }`}
      >
          <div className="flex items-center gap-1 p-1 bg-[#F8F7F3] rounded-2xl w-full border border-[#E6E9E2]/80">
            <button
              onClick={() => setActiveTab('general')}
              className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'general'
                  ? 'bg-[#244D3F] text-white shadow-2xs'
                  : 'text-[#737B75] hover:text-[#18231F]'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>General</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'profile'
                  ? 'bg-[#244D3F] text-white shadow-2xs'
                  : 'text-[#737B75] hover:text-[#18231F]'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Profile</span>
            </button>

            <button
              onClick={() => setActiveTab('faq')}
              className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'faq'
                  ? 'bg-[#244D3F] text-white shadow-2xs'
                  : 'text-[#737B75] hover:text-[#18231F]'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>FAQ</span>
            </button>

            <button
              onClick={() => setActiveTab('privacy')}
              className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'privacy'
                  ? 'bg-[#244D3F] text-white shadow-2xs'
                  : 'text-[#737B75] hover:text-[#18231F]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Privacy</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div
          className={`flex-1 overflow-y-auto p-4 space-y-5 text-xs ${
            isInline ? 'pb-24 max-w-2xl w-full mx-auto' : ''
          }`}
        >
          {/* TAB 1: GENERAL SETTINGS */}
          {activeTab === 'general' && (
            <div className="space-y-4">
              {/* Profile Quick Card */}
              <div
                onClick={() => setActiveTab('profile')}
                className="p-3.5 bg-linear-to-r from-[#244D3F]/5 to-[#2D8060]/10 border border-[#244D3F]/20 rounded-2xl flex items-center justify-between cursor-pointer hover:border-[#244D3F]/40 transition-all shadow-2xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#244D3F] text-white font-extrabold flex items-center justify-center text-sm shadow-xs">
                    {userName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-extrabold text-[#18231F] text-sm flex items-center gap-1.5">
                      <span>{userName}</span>
                      <span className="px-2 py-0.5 bg-[#DCE8B0] text-[#244D3F] text-[10px] font-bold rounded-full">
                        Pro Curator
                      </span>
                    </div>
                    <div className="text-[11px] text-[#737B75]">
                      {stats.dailyStreak}d cleaning streak · {formatBytes(stats.bytesReclaimed)} reclaimed
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#244D3F]" />
              </div>

              {/* Gallery Permission Card */}
              <div className="bg-[#F8F7F3] p-4 rounded-3xl border border-[#E6E9E2] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#244D3F]" />
                    <span className="font-extrabold text-[#18231F]">Photo Library Access</span>
                  </div>
                  <button
                    onClick={handleCyclePermission}
                    className={`px-3 py-1 rounded-xl font-extrabold text-[10px] uppercase tracking-wider transition-all cursor-pointer shadow-2xs ${
                      settings.permissionState === 'granted'
                        ? 'bg-[#2D8060] text-white hover:bg-emerald-700'
                        : settings.permissionState === 'limited'
                        ? 'bg-amber-500 text-white hover:bg-amber-600'
                        : 'bg-[#C86462] text-white hover:bg-red-700'
                    }`}
                    title="Tap to cycle permission status"
                  >
                    {settings.permissionState === 'granted'
                      ? 'All Photos'
                      : settings.permissionState === 'limited'
                      ? 'Limited Access'
                      : 'Denied'}
                  </button>
                </div>

                <p className="text-[11px] text-[#737B75] leading-relaxed">
                  {settings.permissionState === 'granted' &&
                    'Luma has full access to index and help you organize photos and videos.'}
                  {settings.permissionState === 'limited' &&
                    'Limited access mode active. Only specific selected photos are accessible to Luma.'}
                  {settings.permissionState === 'denied' &&
                    'Access denied. Luma cannot index device files until permission is granted.'}
                </p>

                <div className="pt-2 border-t border-[#E6E9E2]/80 flex items-center justify-between text-[11px] text-[#244D3F] font-bold">
                  <span className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" />
                    <span>100% On-Device Processing</span>
                  </span>
                  <span className="text-[10px] text-[#737B75] font-normal">Tap badge to test</span>
                </div>
              </div>

              {/* Cleaning Preferences Group */}
              <div className="space-y-2.5">
                <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-[#737B75] px-1">
                  Cleaning Preferences
                </h3>

                {/* Haptics Switch */}
                <div className="flex items-center justify-between p-3.5 bg-white border border-[#E6E9E2] rounded-2xl shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#F8F7F3] border border-[#E6E9E2] flex items-center justify-center text-[#244D3F]">
                      <Vibrate className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-[#18231F]">Haptic Feedback</div>
                      <div className="text-[11px] text-[#737B75]">
                        Tactile vibration on card swipe and button taps
                      </div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.hapticsEnabled}
                    onChange={handleToggleHaptics}
                    className="w-5 h-5 accent-[#244D3F] cursor-pointer"
                  />
                </div>

                {/* Reduced Motion Switch */}
                <div className="flex items-center justify-between p-3.5 bg-white border border-[#E6E9E2] rounded-2xl shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#F8F7F3] border border-[#E6E9E2] flex items-center justify-center text-[#244D3F]">
                      <Eye className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-[#18231F]">Reduced Motion</div>
                      <div className="text-[11px] text-[#737B75]">
                        Instant card transitions without spring bounce
                      </div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.reducedMotion}
                    onChange={handleToggleReducedMotion}
                    className="w-5 h-5 accent-[#244D3F] cursor-pointer"
                  />
                </div>

                {/* Review Step Safety Switch */}
                <div className="flex items-center justify-between p-3.5 bg-white border border-[#E6E9E2] rounded-2xl shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-[#2D8060]">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-[#18231F]">Review Before Delete</div>
                      <div className="text-[11px] text-[#737B75]">
                        Always preview items marked for removal
                      </div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.showReviewBeforeFinish}
                    onChange={handleToggleReviewSafety}
                    className="w-5 h-5 accent-[#244D3F] cursor-pointer"
                  />
                </div>

                {/* Viewport display frame option if toggler available */}
                {onToggleMobileFrame && (
                  <div className="flex items-center justify-between p-3.5 bg-white border border-[#E6E9E2] rounded-2xl shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#F8F7F3] border border-[#E6E9E2] flex items-center justify-center text-[#244D3F]">
                        <Smartphone className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-[#18231F]">Mobile Phone Bezel</div>
                        <div className="text-[11px] text-[#737B75]">
                          {isMobileFrame ? 'Phone frame active' : 'Full width responsive'}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={onToggleMobileFrame}
                      className="px-3 py-1.5 bg-[#F8F7F3] hover:bg-[#E6E9E2] text-[#18231F] font-bold text-xs rounded-xl cursor-pointer"
                    >
                      {isMobileFrame ? 'Disable' : 'Enable'}
                    </button>
                  </div>
                )}
              </div>

              {/* Data & Storage Cache */}
              <div className="space-y-2.5">
                <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-[#737B75] px-1">
                  Data & Storage Cache
                </h3>

                <div className="p-3.5 bg-white border border-[#E6E9E2] rounded-2xl shadow-xs flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#F8F7F3] border border-[#E6E9E2] flex items-center justify-center text-[#244D3F]">
                      <HardDrive className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-[#18231F]">Temporary Thumbnail Cache</div>
                      <div className="text-[11px] text-[#737B75]">~1.8 MB local indexed previews</div>
                    </div>
                  </div>

                  <button
                    onClick={handleClearCache}
                    className="px-3 py-1.5 bg-[#F8F7F3] hover:bg-[#E6E9E2] text-[#18231F] font-bold text-xs rounded-xl cursor-pointer transition-colors"
                  >
                    {cacheCleared ? 'Cleared ✓' : 'Clear'}
                  </button>
                </div>
              </div>

              {/* Quick links to FAQ & Privacy */}
              <div className="space-y-2.5">
                <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-[#737B75] px-1">
                  Help & Information
                </h3>

                <button
                  onClick={() => setActiveTab('faq')}
                  className="w-full p-3.5 bg-white border border-[#E6E9E2] hover:border-[#244D3F]/40 rounded-2xl shadow-xs flex items-center justify-between text-left transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-700">
                      <HelpCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-[#18231F]">Frequently Asked Questions</div>
                      <div className="text-[11px] text-[#737B75]">
                        How swipe cleaning, undo, and clutter detection work
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#737B75]" />
                </button>

                <button
                  onClick={() => setActiveTab('privacy')}
                  className="w-full p-3.5 bg-white border border-[#E6E9E2] hover:border-[#244D3F]/40 rounded-2xl shadow-xs flex items-center justify-between text-left transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-[#2D8060]">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-[#18231F]">Privacy Policy & Security</div>
                      <div className="text-[11px] text-[#737B75]">
                        Learn how Luma guarantees 100% on-device privacy
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#737B75]" />
                </button>

                {onOpenVerification && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenVerification();
                    }}
                    className="w-full p-3.5 bg-white border border-[#E6E9E2] hover:border-[#244D3F]/40 rounded-2xl shadow-xs flex items-center justify-between text-left transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-[#18231F]">QA & Diagnostics Dashboard</div>
                        <div className="text-[11px] text-[#737B75]">
                          Verify gestures, Expo SDK 57, and test reports
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#737B75]" />
                  </button>
                )}
              </div>

              {/* App Tours Replay */}
              <div className="space-y-2.5">
                <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-[#737B75] px-1">
                  App Tours
                </h3>

                <button
                  onClick={() => {
                    onClose();
                    onReplayOnboarding();
                  }}
                  className="w-full p-3.5 bg-white border border-[#E6E9E2] hover:border-[#244D3F]/40 rounded-2xl shadow-xs flex items-center justify-between text-left transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#DCE8B0]/50 flex items-center justify-center text-[#244D3F]">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-[#18231F]">Replay Onboarding Tour</div>
                      <div className="text-[11px] text-[#737B75]">
                        Play the vector animated walkthrough
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#737B75]" />
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onReplaySplash();
                  }}
                  className="w-full p-3.5 bg-white border border-[#E6E9E2] hover:border-[#244D3F]/40 rounded-2xl shadow-xs flex items-center justify-between text-left transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-[#18231F]">
                      <Camera className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-[#18231F]">Replay Animated Splash Screen</div>
                      <div className="text-[11px] text-[#737B75]">
                        Experience the Picoso mesh gradient & photo-frame assembly
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#737B75]" />
                </button>
              </div>

              {/* Replenish & Reset Controls */}
              <div className="pt-2 space-y-2">
                <button
                  onClick={() => {
                    window.alert('Use the native app to connect your device photo library.');
                  }}
                  className="w-full py-3 px-4 bg-[#244D3F] hover:bg-[#18231F] text-white font-bold text-xs rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Sparkles className="w-4 h-4 text-[#DCE8B0]" />
                  <span>Use the native app</span>
                </button>

                {!showResetConfirm ? (
                  <button
                    onClick={() => setShowResetConfirm(true)}
                    className="w-full py-3 px-4 bg-red-50 hover:bg-red-100 text-[#C86462] font-bold text-xs rounded-2xl border border-red-200/80 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reset Local Records & Stats</span>
                  </button>
                ) : (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-2xl space-y-3">
                    <div className="flex items-start gap-2 text-red-900">
                      <AlertTriangle className="w-4 h-4 text-[#C86462] shrink-0 mt-0.5" />
                      <p className="text-[11px] font-semibold leading-tight">
                        Reset clears this browser’s Luma records. It never changes your device gallery.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          onResetAllData();
                          setShowResetConfirm(false);
                          onClose();
                        }}
                        className="flex-1 py-2 bg-[#C86462] text-white font-bold text-xs rounded-xl hover:bg-red-700 transition-colors cursor-pointer"
                      >
                        Confirm Reset
                      </button>
                      <button
                        onClick={() => setShowResetConfirm(false)}
                        className="flex-1 py-2 bg-white text-[#18231F] font-bold text-xs rounded-xl border border-[#E6E9E2] hover:bg-[#F8F7F3] transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: PROFILE SCREEN */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              {/* Profile Hero Card */}
              <div className="p-5 bg-linear-to-br from-[#1E3B31] via-[#244D3F] to-[#18231F] text-white rounded-3xl shadow-lg relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-36 h-36 bg-[#DCE8B0]/15 rounded-full blur-2xl" />

                <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
                  <div className="w-16 h-16 rounded-full bg-[#DCE8B0] text-[#244D3F] font-extrabold text-2xl flex items-center justify-center shadow-md shrink-0">
                    {userName.slice(0, 2).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    {isEditingName ? (
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="text"
                          value={tempName}
                          onChange={(e) => setTempName(e.target.value)}
                          className="bg-white/15 border border-white/30 rounded-xl px-2.5 py-1 text-sm font-bold text-white focus:outline-hidden focus:border-[#DCE8B0]"
                          placeholder="Your Name"
                          autoFocus
                        />
                        <button
                          onClick={handleSaveName}
                          className="px-2.5 py-1 bg-[#DCE8B0] text-[#244D3F] text-xs font-bold rounded-xl cursor-pointer"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center sm:justify-start gap-2">
                        <h3 className="text-lg font-extrabold tracking-tight text-white">{userName}</h3>
                        <button
                          onClick={() => {
                            setTempName(userName);
                            setIsEditingName(true);
                          }}
                          className="p-1 text-white/70 hover:text-white cursor-pointer"
                          title="Edit name"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    <div className="text-xs text-white/70 mt-0.5">
                      Curator Member since October 2026
                    </div>

                    <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-white/15 border border-white/20 rounded-full text-[10px] font-bold text-[#DCE8B0]">
                        <Award className="w-3 h-3" />
                        Master Curator Level
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lifetime Statistics Grid */}
              <div className="space-y-2">
                <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-[#737B75] px-1">
                  Your Cleaning Impact
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 bg-white border border-[#E6E9E2] rounded-2xl shadow-xs">
                    <div className="flex items-center gap-2 text-[#2D8060] mb-1">
                      <HardDrive className="w-4 h-4" />
                      <span className="text-[11px] font-bold text-[#737B75]">Space Saved</span>
                    </div>
                    <div className="text-lg font-black text-[#18231F] tabular-nums">
                      {formatBytes(stats.bytesReclaimed)}
                    </div>
                    <div className="text-[10px] text-[#737B75] mt-0.5">Reclaimed storage</div>
                  </div>

                  <div className="p-3.5 bg-white border border-[#E6E9E2] rounded-2xl shadow-xs">
                    <div className="flex items-center gap-2 text-amber-500 mb-1">
                      <Flame className="w-4 h-4 fill-amber-500" />
                      <span className="text-[11px] font-bold text-[#737B75]">Active Streak</span>
                    </div>
                    <div className="text-lg font-black text-[#18231F] tabular-nums">
                      {stats.dailyStreak} Days
                    </div>
                    <div className="text-[10px] text-[#737B75] mt-0.5">Daily consistency</div>
                  </div>

                  <div className="p-3.5 bg-white border border-[#E6E9E2] rounded-2xl shadow-xs">
                    <div className="flex items-center gap-2 text-blue-600 mb-1">
                      <Layers className="w-4 h-4" />
                      <span className="text-[11px] font-bold text-[#737B75]">Memories Kept</span>
                    </div>
                    <div className="text-lg font-black text-[#18231F] tabular-nums">
                      {stats.totalKept}
                    </div>
                    <div className="text-[10px] text-[#737B75] mt-0.5">Cherished photos</div>
                  </div>

                  <div className="p-3.5 bg-white border border-[#E6E9E2] rounded-2xl shadow-xs">
                    <div className="flex items-center gap-2 text-red-500 mb-1">
                      <Trash2 className="w-4 h-4" />
                      <span className="text-[11px] font-bold text-[#737B75]">Clutter Cleared</span>
                    </div>
                    <div className="text-lg font-black text-[#18231F] tabular-nums">
                      {stats.totalDeleted}
                    </div>
                    <div className="text-[10px] text-[#737B75] mt-0.5">Removed items</div>
                  </div>
                </div>
              </div>

              {/* Gallery Health Index */}
              <div className="p-4 bg-[#F8F7F3] rounded-2xl border border-[#E6E9E2] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#18231F]">Gallery Health Score</span>
                  <span className="font-extrabold text-sm text-[#244D3F]">{healthScore}%</span>
                </div>
                <div className="w-full bg-[#E6E9E2] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#2D8060] h-full rounded-full transition-all duration-500"
                    style={{ width: `${healthScore}%` }}
                  />
                </div>
                <p className="text-[11px] text-[#737B75]">
                  Calculated from uncluttered photos, low burst duplication, and organized month stacks.
                </p>
              </div>

              {/* Device Environment Details */}
              <div className="p-4 bg-white rounded-2xl border border-[#E6E9E2] space-y-2 text-[11px]">
                <h4 className="font-bold text-[#18231F] text-xs">Device Environment</h4>
                <div className="flex justify-between text-[#737B75] py-1 border-b border-[#E6E9E2]/60">
                  <span>Library Photos Available:</span>
                  <span className="font-bold text-[#18231F]">{allMedia.length} assets</span>
                </div>
                <div className="flex justify-between text-[#737B75] py-1 border-b border-[#E6E9E2]/60">
                  <span>Photo Library Permission:</span>
                  <span className="font-bold text-[#2D8060] capitalize">{settings.permissionState}</span>
                </div>
                <div className="flex justify-between text-[#737B75] py-1">
                  <span>Data Processing Engine:</span>
                  <span className="font-bold text-[#18231F]">100% Client-Side Local Sandbox</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FAQ SCREEN */}
          {activeTab === 'faq' && (
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-[#737B75] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={faqSearch}
                  onChange={(e) => setFaqSearch(e.target.value)}
                  placeholder="Search questions (e.g. undo, delete, privacy)..."
                  className="w-full pl-9 pr-3.5 py-2.5 bg-[#F8F7F3] border border-[#E6E9E2] rounded-2xl text-xs text-[#18231F] placeholder:text-[#737B75] focus:outline-hidden focus:border-[#244D3F]"
                />
              </div>

              {/* FAQ Accordions */}
              <div className="space-y-2.5">
                {filteredFaqs.length === 0 ? (
                  <div className="p-6 text-center text-[#737B75] bg-[#F8F7F3] rounded-2xl border border-[#E6E9E2]">
                    No matching questions found. Try searching for "swipe", "delete", or "privacy".
                  </div>
                ) : (
                  filteredFaqs.map((item) => {
                    const isOpen = expandedFaq === item.id;
                    return (
                      <div
                        key={item.id}
                        className="bg-white border border-[#E6E9E2] rounded-2xl overflow-hidden shadow-2xs transition-colors"
                      >
                        <button
                          onClick={() => setExpandedFaq(isOpen ? null : item.id)}
                          className="w-full p-3.5 text-left flex items-center justify-between gap-3 cursor-pointer hover:bg-[#F8F7F3]/60 transition-colors"
                        >
                          <span className="font-bold text-xs text-[#18231F] leading-snug">
                            {item.question}
                          </span>
                          <ChevronDown
                            className={`w-4 h-4 text-[#737B75] shrink-0 transition-transform duration-200 ${
                              isOpen ? 'rotate-180 text-[#244D3F]' : ''
                            }`}
                          />
                        </button>
                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="px-3.5 pb-3.5 text-[11px] text-[#737B75] leading-relaxed border-t border-[#E6E9E2]/60 pt-2.5 bg-[#F8F7F3]/30">
                                {item.answer}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Direct Support Note */}
              <div className="p-3.5 bg-blue-50/70 border border-blue-200/60 rounded-2xl flex items-start gap-2.5 text-[11px] text-blue-900 leading-relaxed">
                <HelpCircle className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                <div>
                  <strong>Need more help?</strong> Luma is designed to keep your gallery pristine without stress. If you have questions about specific photo formats or albums, tap "Import Media" to test on any subset.
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PRIVACY POLICY SCREEN */}
          {activeTab === 'privacy' && (
            <div className="space-y-4 leading-relaxed text-[#737B75]">
              {/* Privacy Shield Hero */}
              <div className="p-4 bg-linear-to-r from-emerald-50 to-teal-50 border border-emerald-200/60 rounded-2xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#244D3F] text-[#DCE8B0] flex items-center justify-center shrink-0 shadow-xs">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-[#18231F] text-xs">
                    Absolute 100% On-Device Guarantee
                  </h4>
                  <p className="text-[11px] text-[#244D3F]">
                    Your memories never leave your phone. Zero servers, zero trackers.
                  </p>
                </div>
              </div>

              {/* Policy Sections */}
              <div className="bg-white p-4 rounded-2xl border border-[#E6E9E2] space-y-4">
                <div>
                  <h4 className="font-extrabold text-[#18231F] text-xs flex items-center gap-1.5 mb-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#244D3F]" />
                    1. Zero External Data Transmission
                  </h4>
                  <p className="text-[11px] leading-relaxed">
                    Luma is engineered strictly as a client-side utility. Photos, videos, file names, timestamps, location coordinates, and camera EXIF information are processed exclusively within your device memory. No data is ever transmitted across the internet to Luma, Google, Apple, or any external third-party server.
                  </p>
                </div>

                <div>
                  <h4 className="font-extrabold text-[#18231F] text-xs flex items-center gap-1.5 mb-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#244D3F]" />
                    2. Photo Library Permission Scope
                  </h4>
                  <p className="text-[11px] leading-relaxed">
                    When granting photo library access (either Limited or All Photos), the permission is used solely to generate in-memory preview cards, analyze duplicate bursts, and calculate storage reclaimed. Luma never alters files without your explicit, repeated confirmation.
                  </p>
                </div>

                <div>
                  <h4 className="font-extrabold text-[#18231F] text-xs flex items-center gap-1.5 mb-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#244D3F]" />
                    3. Two-Step Review-Before-Delete Safety
                  </h4>
                  <p className="text-[11px] leading-relaxed">
                    Swiping left on a card NEVER executes an immediate deletion. Swiped items remain in an on-device staging list until you open the Review Screen, verify every item, and confirm the system dialog. You always have final authority over what gets removed.
                  </p>
                </div>

                <div>
                  <h4 className="font-extrabold text-[#18231F] text-xs flex items-center gap-1.5 mb-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#244D3F]" />
                    4. No Advertising Identifiers or Trackers
                  </h4>
                  <p className="text-[11px] leading-relaxed">
                    Luma contains zero telemetry SDKs, Google Analytics, Facebook SDKs, or ad trackers. Your usage patterns, session counts, and swipe habits remain completely private to you.
                  </p>
                </div>

                <div>
                  <h4 className="font-extrabold text-[#18231F] text-xs flex items-center gap-1.5 mb-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#244D3F]" />
                    5. Local Cache Control & Erasure
                  </h4>
                  <p className="text-[11px] leading-relaxed">
                    Device photo access is available in the native app. This browser does not access your system gallery.
                  </p>
                </div>
              </div>

              {/* Version & Date Note */}
              <div className="text-[10px] text-[#737B75] text-center pt-1 font-mono">
                Luma Privacy Policy · Effective October 2026 · Build 2.4.0
              </div>
            </div>
          )}
        </div>
    </div>
  );

  if (isInline) {
    return (
      <div className="w-full flex-1 flex flex-col bg-[#F8F7F3] select-none animate-in fade-in duration-200">
        {mainContent}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-lg">
        {mainContent}
      </div>
    </div>
  );
};
