import React, { useState, useEffect, useRef, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { GrammarEditor } from './components/GrammarEditor';
import { SuggestionsPanel } from './components/SuggestionsPanel';
import { CorrectedPanel } from './components/CorrectedPanel';
import { AiWriterModal } from './components/AiWriterModal';
import { AboutModal } from './components/AboutModal';
import { PrivacyModal } from './components/PrivacyModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import {
  GrammarIssue,
  GrammarCheckResponse,
  ServerStatus,
  ReadabilityMetrics,
} from './types';
import { computeReadabilityMetrics, SAMPLE_TEXTS } from './utils/textMetrics';
import { applySingleCorrection, applyAllCorrections } from './utils/grammarEngine';
import {
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Edit3,
  Layers,
  FileCheck,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';

export default function App() {
  // Main State
  const [text, setText] = useState<string>(SAMPLE_TEXTS[0].text);
  const [language, setLanguage] = useState<string>('en-US');
  const [issues, setIssues] = useState<GrammarIssue[]>([]);
  const [correctedText, setCorrectedText] = useState<string>('');
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [appliedCount, setAppliedCount] = useState<number>(0);

  // Status & Flags
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [hasChecked, setHasChecked] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [serverStatus, setServerStatus] = useState<ServerStatus | null>(null);

  // Mobile / Tablet Tab Navigation
  const [mobileTab, setMobileTab] = useState<'editor' | 'suggestions' | 'corrected'>('editor');

  // Modals & Toasts
  const [isAiWriterOpen, setIsAiWriterOpen] = useState<boolean>(false);
  const [isAboutOpen, setIsAboutOpen] = useState<boolean>(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const workspaceRef = useRef<HTMLDivElement>(null);

  // Compute live readability metrics
  const metrics: ReadabilityMetrics = useMemo(() => {
    return computeReadabilityMetrics(text);
  }, [text]);

  // Fetch server status on initial mount
  useEffect(() => {
    fetch('/api/status')
      .then((res) => res.json())
      .then((data) => setServerStatus(data))
      .catch((err) => console.warn('Could not fetch server status:', err));
  }, []);

  // Toast Helper
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Scroll smoothly to workspace
  const scrollToWorkspace = () => {
    workspaceRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // FLOW A: Grammar Check
  const handleCheckGrammar = async () => {
    if (!text.trim()) {
      showToast('Please enter some text before checking.', 'error');
      return;
    }

    setIsChecking(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/grammar/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language }),
      });

      const data: GrammarCheckResponse & { error?: string; details?: string } = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Grammar checking service failed.');
      }

      setIssues(data.issues || []);
      setCorrectedText(data.correctedText || text);
      setHasChecked(true);
      setAppliedCount(0);

      const unappliedCount = (data.issues || []).length;
      if (unappliedCount === 0) {
        showToast('Flawless! Zero errors detected.', 'success');
        try {
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
        } catch {
          // ignore
        }
      } else {
        showToast(`Detected ${unappliedCount} potential issue${unappliedCount > 1 ? 's' : ''}.`, 'info');
      }

      // On mobile, auto-switch to suggestions if errors found
      if (window.innerWidth < 1024 && unappliedCount > 0) {
        setMobileTab('suggestions');
      }
    } catch (err: any) {
      console.error('Check error:', err);
      setErrorMessage(err.message || 'Unable to complete grammar check.');
      showToast(err.message || 'Grammar check failed. Your text has been preserved.', 'error');
    } finally {
      setIsChecking(false);
    }
  };

  // FLOW C: Apply individual correction
  const handleApplySingle = (issueId: string, replacement: string) => {
    const { updatedText, updatedIssues } = applySingleCorrection(text, issueId, replacement, issues);
    setText(updatedText);
    setIssues(updatedIssues);
    setAppliedCount((prev) => prev + 1);
    showToast(`Correction "${replacement}" applied.`, 'success');

    // Check if all are resolved
    const remaining = updatedIssues.filter((i) => !i.applied && !i.dismissed).length;
    if (remaining === 0) {
      try {
        confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
      } catch {
        // ignore
      }
    }
  };

  // Dismiss individual issue
  const handleDismissSingle = (issueId: string) => {
    setIssues((prev) =>
      prev.map((i) => (i.id === issueId ? { ...i, dismissed: true } : i))
    );
    showToast('Suggestion dismissed.', 'info');
  };

  // Apply all corrections simultaneously
  const handleApplyAll = () => {
    const { updatedText, appliedCount: newlyApplied, updatedIssues } = applyAllCorrections(text, issues);
    setText(updatedText);
    setIssues(updatedIssues);
    setAppliedCount((prev) => prev + newlyApplied);
    showToast(`Applied ${newlyApplied} corrections successfully!`, 'success');

    try {
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    } catch {
      // ignore
    }
  };

  // Replace editor text with the full corrected text
  const handleReplaceWithCorrected = () => {
    if (!correctedText) return;
    setText(correctedText);
    setIssues((prev) => prev.map((i) => ({ ...i, applied: true })));
    showToast('Editor updated with corrected version.', 'success');
  };

  // FLOW E: Reset / Clear
  const handleClear = () => {
    setText('');
    setIssues([]);
    setCorrectedText('');
    setSelectedIssueId(null);
    setHasChecked(false);
    setErrorMessage(null);
    setAppliedCount(0);
    showToast('Workspace reset.', 'info');
  };

  // Load sample text
  const handleLoadSample = (sampleText: string = SAMPLE_TEXTS[0].text) => {
    setText(sampleText);
    setIssues([]);
    setCorrectedText('');
    setSelectedIssueId(null);
    setHasChecked(false);
    setErrorMessage(null);
    setAppliedCount(0);
    scrollToWorkspace();
    showToast('Sample text loaded. Click "Check Grammar" to analyze.', 'info');
  };

  // Count of active unapplied issues for mobile badge
  const unappliedCount = useMemo(() => {
    return issues.filter((i) => !i.applied && !i.dismissed).length;
  }, [issues]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Navigation */}
      <Navbar
        serverStatus={serverStatus}
        onOpenAbout={() => setIsAboutOpen(true)}
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
        onOpenAiWriter={() => setIsAiWriterOpen(true)}
        onScrollToEditor={scrollToWorkspace}
      />

      {/* Hero Section */}
      <Hero
        onCheckClick={() => {
          scrollToWorkspace();
          if (text.trim() && !hasChecked) {
            handleCheckGrammar();
          }
        }}
        onSampleClick={() => handleLoadSample(SAMPLE_TEXTS[0].text)}
      />

      {/* Main Workspace */}
      <main ref={workspaceRef} className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Error recovery banner */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start justify-between gap-3 shadow-xs animate-in fade-in">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-rose-900">Grammar Check Notice</p>
                <p className="text-rose-700 mt-0.5">{errorMessage}</p>
                <p className="text-rose-600 text-[11px] mt-1">
                  Your text is preserved in the editor. You can retry immediately.
                </p>
              </div>
            </div>
            <button
              onClick={handleCheckGrammar}
              disabled={isChecking}
              className="px-3 py-1.5 rounded-lg font-bold text-xs bg-rose-600 hover:bg-rose-700 text-white shadow-2xs transition-colors shrink-0"
            >
              Retry Check
            </button>
          </div>
        )}

        {/* Mobile & Tablet Tab Bar (shown below lg screens) */}
        <div className="lg:hidden mb-4 flex items-center bg-white p-1 rounded-2xl border border-slate-200 shadow-2xs text-xs font-semibold">
          <button
            onClick={() => setMobileTab('editor')}
            className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              mobileTab === 'editor'
                ? 'bg-purple-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Editor</span>
          </button>
          <button
            onClick={() => setMobileTab('suggestions')}
            className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              mobileTab === 'suggestions'
                ? 'bg-purple-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Suggestions</span>
            {unappliedCount > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${mobileTab === 'suggestions' ? 'bg-white text-purple-700' : 'bg-purple-100 text-purple-800'}`}>
                {unappliedCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setMobileTab('corrected')}
            className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              mobileTab === 'corrected'
                ? 'bg-purple-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Corrected</span>
          </button>
        </div>

        {/* Two-Column Responsive Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Original Editor & Highlighting */}
          <div
            className={`lg:col-span-7 space-y-6 ${
              mobileTab !== 'editor' ? 'hidden lg:block' : 'block'
            }`}
          >
            <GrammarEditor
              text={text}
              setText={setText}
              language={language}
              setLanguage={setLanguage}
              isChecking={isChecking}
              onCheck={handleCheckGrammar}
              onOpenAiWriter={() => setIsAiWriterOpen(true)}
              onClear={handleClear}
              issues={issues}
              selectedIssueId={selectedIssueId}
              onSelectIssue={(id) => {
                setSelectedIssueId(id);
                if (window.innerWidth < 1024) {
                  setMobileTab('suggestions');
                }
              }}
              metrics={metrics}
              hasChecked={hasChecked}
              appliedCount={appliedCount}
            />

            {/* Quick in-memory privacy disclosure banner */}
            <div className="p-3 bg-purple-50/50 border border-purple-200/60 rounded-xl text-xs text-purple-900 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0" />
                <span className="text-[11px] font-medium text-slate-700">
                  Zero retention: Text is analyzed in-memory and never permanently stored on disks or databases.
                </span>
              </div>
              <button
                onClick={() => setIsPrivacyOpen(true)}
                className="text-[11px] font-bold text-purple-700 hover:underline shrink-0"
              >
                Learn More
              </button>
            </div>
          </div>

          {/* Right Column: Suggestions Panel OR Corrected Panel */}
          <div className="lg:col-span-5 space-y-6">
            {/* On mobile: show specific tab */}
            {/* On desktop: show suggestions & corrected side-by-side or stacked */}
            <div className={`${mobileTab === 'suggestions' || window.innerWidth >= 1024 ? 'block' : 'hidden'}`}>
              <SuggestionsPanel
                issues={issues}
                selectedIssueId={selectedIssueId}
                onSelectIssue={setSelectedIssueId}
                onApplySingle={handleApplySingle}
                onDismissSingle={handleDismissSingle}
                onApplyAll={handleApplyAll}
                isChecking={isChecking}
                hasChecked={hasChecked}
                totalIssuesCount={issues.length}
                appliedCount={appliedCount}
              />
            </div>

            <div className={`${mobileTab === 'corrected' || window.innerWidth >= 1024 ? 'block' : 'hidden'} ${window.innerWidth >= 1024 ? 'mt-6' : ''}`}>
              <CorrectedPanel
                originalText={text}
                correctedText={correctedText}
                onApplyToEditor={handleReplaceWithCorrected}
                onSendToAiWriter={() => setIsAiWriterOpen(true)}
                onShowToast={showToast}
                hasChecked={hasChecked}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <AiWriterModal
        isOpen={isAiWriterOpen}
        onClose={() => setIsAiWriterOpen(false)}
        initialText={text}
        onApplyRevision={(newText) => {
          setText(newText);
          setIssues([]);
          setCorrectedText(newText);
          setHasChecked(false);
          setAppliedCount(0);
        }}
        onShowToast={showToast}
        geminiConfigured={Boolean(serverStatus?.geminiConfigured)}
      />

      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />

      <PrivacyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />

      {/* Floating Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-slate-800">GrammarGlow AI</span>
            <span>—</span>
            <span>Hacktoberfest 2026 Problem Statement #13</span>
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={() => setIsAboutOpen(true)} className="hover:text-slate-800 transition-colors">
              About Project
            </button>
            <button onClick={() => setIsPrivacyOpen(true)} className="hover:text-slate-800 transition-colors">
              Privacy Notice
            </button>
            <button onClick={() => handleLoadSample()} className="hover:text-indigo-600 transition-colors">
              Sample Texts
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
