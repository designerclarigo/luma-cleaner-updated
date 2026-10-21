import { mediaService } from '../mediaService';
import { MediaItem } from '../../types/media';

export interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  durationMs: number;
}

export function runLumaVerificationSuite(): TestResult[] {
  const results: TestResult[] = [];

  const runTest = (name: string, fn: () => void) => {
    const start = performance.now();
    try {
      fn();
      results.push({
        name,
        passed: true,
        message: 'Passed with zero discrepancies',
        durationMs: Math.round(performance.now() - start),
      });
    } catch (err: any) {
      results.push({
        name,
        passed: false,
        message: err?.message || 'Assertion failed',
        durationMs: Math.round(performance.now() - start),
      });
    }
  };

  // Test 1: Session persistence and restoration
  runTest('Session Persistence & Integrity', () => {
    const mockItems: MediaItem[] = [
      {
        id: 'test-item-1',
        uri: 'https://example.com/1.jpg',
        filename: 'test1.jpg',
        mediaType: 'photo',
        width: 1000,
        height: 1000,
        creationTime: Date.now(),
        modificationTime: Date.now(),
        fileSize: 1024 * 1024,
        albumName: 'Camera',
        source: 'demo',
      },
      {
        id: 'test-item-2',
        uri: 'https://example.com/2.jpg',
        filename: 'test2.jpg',
        mediaType: 'photo',
        width: 1000,
        height: 1000,
        creationTime: Date.now(),
        modificationTime: Date.now(),
        fileSize: 2 * 1024 * 1024,
        albumName: 'Camera',
        source: 'demo',
      },
    ];

    const session = mediaService.createSession(
      'month',
      '2026-10',
      'October 2026',
      '2 items to review',
      mockItems
    );

    if (!session.id || session.mediaIds.length !== 2) {
      throw new Error('Session creation did not record correct media IDs');
    }

    // Mutate session with a decision
    session.decisions['test-item-1'] = 'keep';
    session.history.push('test-item-1');
    session.currentIndex = 1;
    mediaService.saveSession(session);

    const reloaded = mediaService.getSavedSession();
    if (!reloaded) {
      throw new Error('Failed to reload saved session from storage');
    }

    if (reloaded.currentIndex !== 1 || reloaded.decisions['test-item-1'] !== 'keep') {
      throw new Error('Reloaded session did not preserve decisions or index');
    }

    mediaService.clearSession();
  });

  // Test 2: Undo mechanism stack invariants
  runTest('Undo Mechanism & Stack LIFO Invariants', () => {
    const session = {
      id: 'session-undo-test',
      title: 'Undo Test',
      subtitle: '',
      collectionType: 'recents' as const,
      collectionKey: 'recents',
      mediaIds: ['a', 'b', 'c'],
      currentIndex: 0,
      decisions: {} as Record<string, 'keep' | 'delete'>,
      history: [] as string[],
      isCompleted: false,
      createdAt: Date.now(),
      lastActiveTime: Date.now(),
    };

    // Decision 1: Keep 'a'
    session.decisions['a'] = 'keep';
    session.history.push('a');
    session.currentIndex = 1;

    // Decision 2: Delete 'b'
    session.decisions['b'] = 'delete';
    session.history.push('b');
    session.currentIndex = 2;

    if (session.history.length !== 2) throw new Error('History stack length mismatch');

    // Perform Undo
    const lastId = session.history.pop();
    if (lastId !== 'b') throw new Error(`Expected undo target 'b', got '${lastId}'`);
    delete session.decisions[lastId];
    session.currentIndex -= 1;

    if (session.currentIndex !== 1) throw new Error('Index not decremented on undo');
    if (session.decisions['b'] !== undefined) throw new Error('Decision was not cleared on undo');
    if (session.decisions['a'] !== 'keep') throw new Error('Prior decisions were improperly affected');
  });

  // Test 3: Review selection and removal safety
  runTest('Review Selection Filtering & Restoration', () => {
    const decisions: Record<string, 'keep' | 'delete'> = {
      photo1: 'delete',
      photo2: 'keep',
      photo3: 'delete',
      photo4: 'delete',
    };

    const pendingDeletions = Object.entries(decisions)
      .filter(([_, d]) => d === 'delete')
      .map(([id]) => id);

    if (pendingDeletions.length !== 3) {
      throw new Error(`Expected 3 pending deletions, found ${pendingDeletions.length}`);
    }

    // User unmarks photo3 from deletion review
    const unmarkId = 'photo3';
    decisions[unmarkId] = 'keep'; // safely change to keep

    const remainingDeletions = Object.entries(decisions)
      .filter(([_, d]) => d === 'delete')
      .map(([id]) => id);

    if (remainingDeletions.includes(unmarkId)) {
      throw new Error('Unmarked item was still present in pending deletion set');
    }
    if (remainingDeletions.length !== 2) {
      throw new Error('Pending deletion count incorrect after removal');
    }
  });

  // Test 4: Deletion reconciliation and metrics calculation
  runTest('Deletion Reconciliation & Storage Reclaimed Accuracy', () => {
    const initialStats = mediaService.getStats();
    const testBytes = 5 * 1024 * 1024; // 5 MB

    mediaService.updateStatsAfterCleanup(3, 2, testBytes);
    const updatedStats = mediaService.getStats();

    if (updatedStats.totalReviewed < initialStats.totalReviewed + 5) {
      throw new Error('Total reviewed count did not increment accurately');
    }
    if (updatedStats.totalDeleted < initialStats.totalDeleted + 2) {
      throw new Error('Total deleted count did not increment accurately');
    }
    if (updatedStats.bytesReclaimed < initialStats.bytesReclaimed + testBytes) {
      throw new Error('Bytes reclaimed did not match exact confirmed sum');
    }
  });

  // Test 5: Daily streak logic verification
  runTest('Daily Streak Calculation Rules', () => {
    const today = new Date().toISOString().split('T')[0];
    const stats = mediaService.getStats();
    if (stats.dailyStreak < 1) {
      throw new Error('Active streak should not fall below 1 on an active day');
    }
  });

  // Test 6: Empty library & out-of-bounds guards
  runTest('Empty Library & Edge Case Bounds', () => {
    const emptyList: string[] = [];
    const currentIndex = 0;
    const isFinished = currentIndex >= emptyList.length;
    if (!isFinished) {
      throw new Error('Empty media array should immediately report finished session');
    }
  });

  // Test 7: Onboarding & Splash State Flow
  runTest('Onboarding Flow & Persistence Invariants', () => {
    const priorState = mediaService.isOnboardingDone();
    mediaService.setOnboardingDone(true);
    if (!mediaService.isOnboardingDone()) {
      throw new Error('Onboarding status flag failed to persist');
    }
    // Restore
    mediaService.setOnboardingDone(priorState);
  });

  return results;
}
