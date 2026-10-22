import React, { useState, useEffect } from 'react';
import {
  CleanupSession,
  MediaItem,
  MonthCollection,
  AppSettings,
} from './types/media';
import { mediaService } from './services/mediaService';
import { Header } from './components/common/Header';
import { BottomNav, TabType } from './components/common/BottomNav';
import { HomeScreen } from './components/home/HomeScreen';
import { CleanupScreen } from './components/clean/CleanupScreen';
import { ReviewSheet } from './components/clean/ReviewSheet';
import { ResultsScreen } from './components/clean/ResultsScreen';
import { BookmarksScreen } from './components/bookmarks/BookmarksScreen';
import { InsightsScreen } from './components/insights/InsightsScreen';
import { SettingsScreen } from './components/settings/SettingsScreen';
import { VerificationModal } from './components/verification/VerificationModal';
import { ImportMediaModal } from './components/common/ImportMediaModal';
import { OnboardingModal } from './components/onboarding/OnboardingModal';
import { AnimatedSplashScreen } from './components/splash/AnimatedSplashScreen';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('clean');
  const [activeSession, setActiveSession] = useState<CleanupSession | null>(() =>
    mediaService.getSavedSession()
  );

  // Modal / Flow controls
  const [showReviewSheet, setShowReviewSheet] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [resultsData, setResultsData] = useState<{
    title: string;
    kept: number;
    deleted: number;
    bytes: number;
    streak: number;
  } | null>(null);

  const [showSettings, setShowSettings] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() =>
    !mediaService.isOnboardingDone()
  );

  // Settings & display
  const [settings, setSettings] = useState<AppSettings>(() =>
    mediaService.getSettings()
  );
  const [isMobileFrame, setIsMobileFrame] = useState(true);

  // Dynamic collections & state triggers
  const [collections, setCollections] = useState<MonthCollection[]>(() =>
    mediaService.getMonthCollections()
  );
  const [albums, setAlbums] = useState(() => mediaService.getAlbums());
  const [stats, setStats] = useState(() => mediaService.getStats());
  const [bookmarkCount, setBookmarkCount] = useState(
    () => mediaService.getBookmarks().length
  );

  const refreshAllState = () => {
    setCollections(mediaService.getMonthCollections());
    setAlbums(mediaService.getAlbums());
    setStats(mediaService.getStats());
    setBookmarkCount(mediaService.getBookmarks().length);
    setActiveSession(mediaService.getSavedSession());
  };

  const handleUpdateSettings = (partial: Partial<AppSettings>) => {
    const updated = mediaService.persistSettings(partial);
    setSettings(updated);
  };

  // Start new cleaning session
  const handleStartSession = (
    type: CleanupSession['collectionType'],
    key: string,
    title: string,
    subtitle: string,
    items: MediaItem[]
  ) => {
    const session = mediaService.createSession(type, key, title, subtitle, items);
    setActiveSession(session);
  };

  const handleResumeSession = () => {
    const session = mediaService.getSavedSession();
    if (session) {
      setActiveSession(session);
    }
  };

  const handleUpdateSession = (updated: CleanupSession) => {
    setActiveSession(updated);
    mediaService.saveSession(updated);
  };

  // When session items finish
  const handleFinishSession = (session: CleanupSession) => {
    const deleteIds = Object.entries(session.decisions)
      .filter(([_, d]) => d === 'delete')
      .map(([id]) => id);

    if (deleteIds.length > 0 && settings.showReviewBeforeFinish) {
      setShowReviewSheet(true);
    } else if (deleteIds.length > 0) {
      window.alert('Use the native app for system photo deletion confirmation.');
    } else {
      // Kept everything
      finalizeSession([], session);
    }
  };

  // Deletion confirmed via Review Sheet
  const handleReviewConfirm = (finalIdsToDelete: string[]) => {
    setShowReviewSheet(false);
    if (finalIdsToDelete.length > 0) {
      window.alert('Use the native app for system photo deletion confirmation.');
    } else if (activeSession) {
      finalizeSession([], activeSession);
    }
  };


  // Complete cleanup and show results
  const finalizeSession = (
    deletedIds: string[],
    session: CleanupSession,
    deletedCount = 0,
    keptCount = session.mediaIds.length,
    bytesReclaimed = 0
  ) => {
    mediaService.completeSession(session);
    refreshAllState();

    setResultsData({
      title: session.title,
      kept: keptCount,
      deleted: deletedCount,
      bytes: bytesReclaimed,
      streak: mediaService.getStats().dailyStreak,
    });

    setActiveSession(null);
    setShowResults(true);
  };

  const handleResetData = () => {
    mediaService.resetAllData();
    refreshAllState();
  };

  // Main screen renderer
  const renderScreen = () => {
    if (showResults && resultsData) {
      return (
        <ResultsScreen
          sessionTitle={resultsData.title}
          keptCount={resultsData.kept}
          deletedCount={resultsData.deleted}
          bytesReclaimed={resultsData.bytes}
          dailyStreak={resultsData.streak}
          onCleanAnother={() => {
            setShowResults(false);
            setResultsData(null);
            setActiveTab('clean');
          }}
          onGoHome={() => {
            setShowResults(false);
            setResultsData(null);
            setActiveTab('clean');
          }}
        />
      );
    }

    if (activeSession) {
      return (
        <CleanupScreen
          session={activeSession}
          onUpdateSession={handleUpdateSession}
          onFinishSession={handleFinishSession}
          onBack={() => {
            setActiveSession(null);
            refreshAllState();
          }}
          onOpenReview={() => setShowReviewSheet(true)}
          reducedMotion={settings.reducedMotion}
        />
      );
    }

    switch (activeTab) {
      case 'bookmarks':
        return (
          <BookmarksScreen
            onRefresh={refreshAllState}
            onStartCleaning={() => setActiveTab('clean')}
          />
        );
      case 'insights':
        return <InsightsScreen />;
      case 'settings':
        return (
          <SettingsScreen
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onClose={() => setActiveTab('clean')}
            onResetAllData={handleResetData}
            onReplaySplash={() => setShowSplash(true)}
            onReplayOnboarding={() => setShowOnboarding(true)}
            isMobileFrame={isMobileFrame}
            onToggleMobileFrame={() => setIsMobileFrame(!isMobileFrame)}
            onOpenVerification={() => setShowVerification(true)}
            isInlineTab={true}
          />
        );
      case 'clean':
      default:
        return (
          <HomeScreen
            savedSession={mediaService.getSavedSession()}
            monthCollections={collections}
            albums={albums}
            onStartSession={handleStartSession}
            onResumeSession={handleResumeSession}
            dailyStreak={stats.dailyStreak}
            totalDeleted={stats.totalDeleted}
            bytesReclaimed={stats.bytesReclaimed}
            permissionState={settings.permissionState}
            onOpenSettings={() => setActiveTab('settings')}
            onNativeRequired={() => window.alert('Use the native app to connect your device photo library.')}
            onImportMedia={() => window.alert('Use the native app to connect your device photo library.')}
          />
        );
    }
  };

  // Splash & Onboarding as dedicated high-priority full-screen views
  if (showSplash) {
    return (
      <AnimatedSplashScreen
        onFinish={() => setShowSplash(false)}
        reducedMotion={settings.reducedMotion}
      />
    );
  }

  if (showOnboarding) {
    return (
      <OnboardingModal
        onComplete={() => {
          mediaService.setOnboardingDone(true);
          setShowOnboarding(false);
          refreshAllState();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#EFECE6] text-[#18231F] flex flex-col items-center justify-start p-0 sm:py-4 select-none transition-all duration-300">
      {/* Sleek responsive container with optional flagship phone bezel */}
      <div
        className={`w-full min-h-screen sm:min-h-[840px] bg-[#F8F7F3] flex flex-col relative overflow-hidden transition-all duration-300 ${
          isMobileFrame
            ? 'max-w-md sm:rounded-[40px] sm:shadow-[0_24px_60px_-15px_rgba(24,35,31,0.22)] sm:border-[8px] sm:border-[#18231F]/90 sm:ring-1 sm:ring-black/10'
            : 'max-w-3xl sm:rounded-[28px] sm:shadow-xl sm:border sm:border-[#E6E9E2]'
        }`}
      >
        {/* Dynamic Island / Phone Speaker notch in mobile frame mode */}
        {isMobileFrame && (
          <div className="hidden sm:flex items-center justify-center pt-2 pb-0 shrink-0 bg-[#F8F7F3]">
            <div className="w-24 h-4 bg-[#18231F] rounded-full flex items-center justify-end px-2">
              <div className="w-2 h-2 rounded-full bg-[#244D3F] opacity-80" />
            </div>
          </div>
        )}
        {/* Global Header with responsive logo and Import Media button */}
        {!activeSession && !showResults && (
          <Header
            onImportMedia={() => window.alert('Use the native app to connect your device photo library.')}
          />
        )}

        {/* Main Body Viewport */}
        <main className="flex-1 w-full overflow-x-hidden overflow-y-auto">
          {renderScreen()}
        </main>

        {/* Bottom Nav Bar (docked inside container) */}
        {!activeSession && !showResults && (
          <BottomNav
            activeTab={activeTab}
            onChangeTab={(tab) => {
              setActiveTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            bookmarkCount={bookmarkCount}
          />
        )}
      </div>

      {/* Review Sheet Modal */}
      {showReviewSheet && activeSession && (
        <ReviewSheet
          session={activeSession}
          onClose={() => setShowReviewSheet(false)}
          onConfirmDeletion={handleReviewConfirm}
          onKeepAll={() => {
            setShowReviewSheet(false);
            finalizeSession([], activeSession);
          }}
        />
      )}


      {/* Settings Modal */}
      {showSettings && (
        <SettingsScreen
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onClose={() => setShowSettings(false)}
          onResetAllData={handleResetData}
          onReplaySplash={() => setShowSplash(true)}
          onReplayOnboarding={() => setShowOnboarding(true)}
          isMobileFrame={isMobileFrame}
          onToggleMobileFrame={() => setIsMobileFrame(!isMobileFrame)}
          onOpenVerification={() => setShowVerification(true)}
        />
      )}

      {/* QA Verification Report */}
      {showVerification && (
        <VerificationModal onClose={() => setShowVerification(false)} />
      )}

      {/* Import Local Media Modal */}
      {showImport && (
        <ImportMediaModal
          onClose={() => setShowImport(false)}
          onImportComplete={refreshAllState}
        />
      )}
    </div>
  );
}
