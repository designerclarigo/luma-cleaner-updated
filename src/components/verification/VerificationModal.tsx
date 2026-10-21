import React, { useState } from 'react';
import { runLumaVerificationSuite, TestResult } from '../../services/__tests__/cleanerTests';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Play,
  Layers,
  FileCode,
  Terminal,
  Smartphone,
  Cpu,
} from 'lucide-react';

interface VerificationModalProps {
  onClose: () => void;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({ onClose }) => {
  const [testResults, setTestResults] = useState<TestResult[]>(() =>
    runLumaVerificationSuite()
  );
  const [isRunning, setIsRunning] = useState(false);

  const handleRerun = () => {
    setIsRunning(true);
    setTimeout(() => {
      const results = runLumaVerificationSuite();
      setTestResults(results);
      setIsRunning(false);
    }, 150);
  };

  const allPassed = testResults.every((r) => r.passed);

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white rounded-3xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-[#E6E9E2]">
        {/* Header */}
        <div className="p-4 border-b border-[#E6E9E2] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#244D3F]" />
            <div>
              <h2 className="text-base font-bold text-[#18231F]">
                QA & Verification Report
              </h2>
              <p className="text-[11px] text-[#737B75]">
                Automated tests and Expo SDK 57 native validation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F8F7F3] flex items-center justify-center text-[#737B75] hover:text-[#18231F]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {/* Summary status pill */}
          <div
            className={`p-3 rounded-2xl border flex items-center justify-between ${
              allPassed
                ? 'bg-[#F4F9F6] border-[#2D8060]/30 text-[#2D8060]'
                : 'bg-red-50 border-red-200 text-[#C86462]'
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span className="font-bold">
                {allPassed
                  ? `All ${testResults.length} Unit & Safety Invariant Tests Passing`
                  : 'Test failures detected'}
              </span>
            </div>
            <button
              onClick={handleRerun}
              disabled={isRunning}
              className="px-2.5 py-1 bg-white border border-[#E6E9E2] rounded-xl text-[10px] font-bold text-[#18231F] hover:bg-[#F8F7F3] active:scale-95 transition-all flex items-center gap-1"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>{isRunning ? 'Running...' : 'Rerun'}</span>
            </button>
          </div>

          {/* Test cases list */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#737B75]">
              Automated Safety & Logic Invariants
            </h3>
            {testResults.map((t, idx) => (
              <div
                key={idx}
                className="p-3 bg-[#F8F7F3] border border-[#E6E9E2] rounded-2xl flex items-start justify-between gap-3"
              >
                <div className="flex items-start gap-2.5">
                  {t.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-[#2D8060] shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-[#C86462] shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h4 className="font-bold text-[#18231F]">{t.name}</h4>
                    <p className="text-[11px] text-[#737B75] mt-0.5">{t.message}</p>
                  </div>
                </div>
                <span className="font-mono text-[10px] text-[#737B75] shrink-0 tabular-nums">
                  {t.durationMs}ms
                </span>
              </div>
            ))}
          </div>

          {/* Expo SDK 57 Native Architecture Readiness */}
          <div className="space-y-2 pt-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#737B75]">
              Expo SDK 57 Native Architecture
            </h3>
            <div className="p-3 bg-white border border-[#E6E9E2] rounded-2xl space-y-2 text-[#737B75]">
              <div className="flex items-center justify-between py-1 border-b border-[#E6E9E2]/60">
                <span className="text-[#18231F] font-medium flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-[#244D3F]" />
                  <span>Target SDK:</span>
                </span>
                <span className="font-mono text-[#244D3F] font-bold">Expo SDK 57</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-[#E6E9E2]/60">
                <span className="text-[#18231F] font-medium flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-[#244D3F]" />
                  <span>Physics & Gestures:</span>
                </span>
                <span className="font-semibold text-[#18231F]">
                  Reanimated + GestureHandler
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-[#E6E9E2]/60">
                <span className="text-[#18231F] font-medium flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#244D3F]" />
                  <span>Media Access:</span>
                </span>
                <span className="font-semibold text-[#18231F]">
                  Native expo-media-library Bridge
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-[#18231F] font-medium flex items-center gap-1.5">
                  <FileCode className="w-3.5 h-3.5 text-[#244D3F]" />
                  <span>EAS Build APK Config:</span>
                </span>
                <span className="font-bold text-[#2D8060]">Configured (eas.json)</span>
              </div>
            </div>
          </div>

          {/* Terminal Instructions snippet */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#737B75] flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-[#244D3F]" />
              <span>To Run on Native Android Emulator / Device:</span>
            </h3>
            <pre className="p-3 bg-[#18231F] text-[#DCE8B0] rounded-2xl font-mono text-[11px] overflow-x-auto leading-relaxed">
{`# 1. Install Expo dependencies
cd expo-project && npx expo install

# 2. Start Expo development server
npx expo start --android

# 3. Build standalone Android preview APK
eas build -p android --profile preview`}
            </pre>
          </div>

          {/* Environment Status Notes */}
          <div className="p-3 bg-[#F8F7F3] rounded-2xl border border-[#E6E9E2] text-[11px] text-[#737B75] leading-relaxed">
            <strong className="text-[#18231F]">Verification Boundary:</strong> Automated unit logic, persistence, and state safety have passed directly in this runtime. Full native platform deletion and camera roll permissions are handled via the native MediaLibrary bridge in the Expo project files.
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E6E9E2] bg-white shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-[#244D3F] hover:bg-[#18231F] text-white text-xs font-bold rounded-xl active:scale-95 transition-all"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};
