import React, { useState, useMemo } from 'react';
import {
  Copy,
  Check,
  Download,
  ArrowRight,
  GitCompare,
  FileCheck,
  Bot,
  Sparkles,
} from 'lucide-react';
import { computeWordDiff, DiffToken } from '../utils/textMetrics';

interface CorrectedPanelProps {
  originalText: string;
  correctedText: string;
  onApplyToEditor: () => void;
  onSendToAiWriter: () => void;
  onShowToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  hasChecked: boolean;
}

export const CorrectedPanel: React.FC<CorrectedPanelProps> = ({
  originalText,
  correctedText,
  onApplyToEditor,
  onSendToAiWriter,
  onShowToast,
  hasChecked,
}) => {
  const [activeTab, setActiveTab] = useState<'corrected' | 'diff'>('corrected');
  const [copied, setCopied] = useState(false);

  // Compute visual diff between original and corrected
  const diffTokens = useMemo(() => {
    if (!originalText || !correctedText) return [];
    return computeWordDiff(originalText, correctedText);
  }, [originalText, correctedText]);

  const hasChanges = originalText !== correctedText && originalText.trim().length > 0;

  const handleCopy = async () => {
    if (!correctedText) return;
    try {
      await navigator.clipboard.writeText(correctedText);
      setCopied(true);
      onShowToast('Corrected text copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      onShowToast('Failed to copy to clipboard', 'error');
    }
  };

  const handleDownload = () => {
    if (!correctedText) return;
    const blob = new Blob([correctedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `GrammarGlow-Corrected-${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    onShowToast('Downloaded corrected text file', 'success');
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/90 overflow-hidden flex flex-col h-full">
      {/* Header bar */}
      <div className="p-3 sm:px-5 sm:py-3.5 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {/* Tab switcher */}
          <div className="flex items-center bg-slate-200/70 p-0.5 rounded-lg text-xs font-medium">
            <button
              onClick={() => setActiveTab('corrected')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                activeTab === 'corrected'
                  ? 'bg-white text-slate-800 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>Corrected Version</span>
            </button>
            <button
              onClick={() => setActiveTab('diff')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                activeTab === 'diff'
                  ? 'bg-white text-slate-800 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GitCompare className="w-3.5 h-3.5 text-purple-600" />
              <span>Visual Diff</span>
            </button>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopy}
            disabled={!correctedText}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg shadow-2xs transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            title="Copy corrected text"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-600" />
                <span>Copy</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            disabled={!correctedText}
            className="p-1 sm:px-2.5 sm:py-1 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg shadow-2xs transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            title="Download as text file (.txt)"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Content panel */}
      <div className="flex-1 p-4 sm:p-5 overflow-y-auto min-h-[300px]">
        {!hasChecked || !correctedText ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 py-12">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-600">Corrected text will appear here</p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              Run grammar check to view a clean corrected version and side-by-side visual difference.
            </p>
          </div>
        ) : activeTab === 'corrected' ? (
          <div className="text-slate-800 text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-sans select-text">
            {correctedText}
          </div>
        ) : (
          <div className="text-slate-800 text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-sans select-text">
            {diffTokens.length === 0 ? (
              <span className="text-slate-500 italic">No differences found.</span>
            ) : (
              diffTokens.map((token, idx) => {
                if (token.type === 'removed') {
                  return (
                    <span
                      key={idx}
                      className="bg-rose-100 text-rose-800 line-through decoration-rose-500 decoration-1 px-1 py-0.5 rounded mx-0.5"
                    >
                      {token.value}
                    </span>
                  );
                }
                if (token.type === 'added') {
                  return (
                    <span
                      key={idx}
                      className="bg-emerald-100 text-emerald-800 font-medium px-1 py-0.5 rounded mx-0.5"
                    >
                      {token.value}
                    </span>
                  );
                }
                return <span key={idx}>{token.value}</span>;
              })
            )}
          </div>
        )}
      </div>

      {/* Bottom Action Footer */}
      {hasChecked && correctedText && (
        <div className="p-3 sm:px-4 sm:py-3 bg-slate-50 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="text-slate-500 font-medium">
            {hasChanges ? (
              <span className="text-indigo-600 font-semibold">
                ✓ Corrections prepared
              </span>
            ) : (
              <span className="text-emerald-600 font-semibold">
                ✓ Already 100% correct
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {hasChanges && (
              <button
                onClick={onApplyToEditor}
                className="px-3 py-1.5 rounded-lg font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 shadow-2xs transition-all flex items-center gap-1.5"
                title="Replace your input text with this corrected version"
              >
                <span>Replace in Editor</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              </button>
            )}

            <button
              onClick={onSendToAiWriter}
              className="px-3 py-1.5 rounded-lg font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 shadow-2xs transition-all flex items-center gap-1.5"
              title="Enhance tone, clarity, and style with Gemini AI"
            >
              <Bot className="w-3.5 h-3.5 text-purple-600" />
              <span>Refine with AI</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
