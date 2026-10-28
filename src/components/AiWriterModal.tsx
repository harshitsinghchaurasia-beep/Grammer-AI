import React, { useState } from 'react';
import {
  X,
  Bot,
  Sparkles,
  Check,
  Copy,
  ArrowRight,
  TrendingUp,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
} from 'lucide-react';
import { WritingStyle, AiRewriteResponse, KeyChange } from '../types';

interface AiWriterModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialText: string;
  onApplyRevision: (newText: string) => void;
  onShowToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  geminiConfigured: boolean;
}

const STYLES: Array<{ id: WritingStyle; label: string; desc: string; icon: string }> = [
  { id: 'formal', label: 'Formal', desc: 'Diplomatic, polished, elevated vocabulary', icon: '👔' },
  { id: 'professional', label: 'Professional', desc: 'Modern workplace clarity, courteous and confident', icon: '💼' },
  { id: 'academic', label: 'Academic', desc: 'Scholarly, rigorous, objective, syntactically rich', icon: '🎓' },
  { id: 'concise', label: 'Concise', desc: 'Direct, crisp, cuts filler words and redundancies', icon: '⚡' },
  { id: 'casual', label: 'Casual', desc: 'Friendly, warm, conversational and approachable', icon: '☕' },
];

export const AiWriterModal: React.FC<AiWriterModalProps> = ({
  isOpen,
  onClose,
  initialText,
  onApplyRevision,
  onShowToast,
  geminiConfigured,
}) => {
  const [style, setStyle] = useState<WritingStyle>('formal');
  const [customGoal, setCustomGoal] = useState('');
  const [inputText, setInputText] = useState(initialText);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AiRewriteResponse | null>(null);
  const [copied, setCopied] = useState(false);

  // Sync initialText when modal opens
  React.useEffect(() => {
    if (isOpen && initialText) {
      setInputText(initialText);
    }
  }, [isOpen, initialText]);

  if (!isOpen) return null;

  const handleRewrite = async () => {
    if (!inputText.trim()) {
      setError('Please provide text to rewrite.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/ai/improve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          style,
          customGoal: customGoal.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === 'GEMINI_API_KEY_UNAVAILABLE') {
          setError(
            'Gemini API key is not yet configured in environment secrets. You can still use the core LanguageTool Grammar Checker without restrictions!'
          );
        } else {
          setError(data.message || 'Failed to rewrite text with AI.');
        }
        setIsLoading(false);
        return;
      }

      setResult(data);
      onShowToast('AI enhancement completed!', 'success');
    } catch (err: any) {
      setError(err.message || 'Network error occurred while calling AI service.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result?.rewrittenText) return;
    try {
      await navigator.clipboard.writeText(result.rewrittenText);
      setCopied(true);
      onShowToast('Revised text copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      onShowToast('Failed to copy to clipboard', 'error');
    }
  };

  const handleAdopt = () => {
    if (!result?.rewrittenText) return;
    onApplyRevision(result.rewrittenText);
    onShowToast('Applied AI revision to main editor!', 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 sm:px-6 sm:py-4 bg-gradient-to-r from-purple-50 via-indigo-50 to-white border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-sm">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-slate-900">
                  Gemini AI Writing Studio
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                  Gemini 3.8 Flash
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Polished stylistic rewriting, syntactic flow, and clarity transformation
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Style Selector Chips */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Writing Tone & Style
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {STYLES.map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setStyle(st.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    style === st.id
                      ? 'border-purple-600 bg-purple-50/80 ring-2 ring-purple-100 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-lg mb-1">{st.icon}</div>
                  <div className="font-bold text-xs text-slate-900">{st.label}</div>
                  <div className="text-[10px] text-slate-500 line-clamp-2 mt-0.5 leading-tight">
                    {st.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Intent / Focus (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Custom Objective or Instructions (Optional):
            </label>
            <input
              type="text"
              value={customGoal}
              onChange={(e) => setCustomGoal(e.target.value)}
              placeholder="e.g., Make it sound confident for a venture pitch, or keep sentences short and punchy"
              className="w-full text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-slate-50/50"
            />
          </div>

          {/* Input text preview / edit */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Source Text
              </label>
              <span className="text-[11px] text-slate-400">
                {inputText.trim().split(/\s+/).filter(Boolean).length} words
              </span>
            </div>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter text to polish and rewrite..."
              rows={4}
              className="w-full p-3 text-xs sm:text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none font-sans"
            />
          </div>

          {/* Trigger Button */}
          <div className="flex justify-end">
            <button
              onClick={handleRewrite}
              disabled={isLoading || !inputText.trim()}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Gemini is refining your prose...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Rewrite with AI</span>
                </>
              )}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Notice</p>
                <p className="mt-0.5 text-rose-700">{error}</p>
              </div>
            </div>
          )}

          {/* AI Result Section */}
          {result && (
            <div className="pt-4 border-t border-slate-200 space-y-4 animate-in fade-in duration-200">
              {/* Clarity & Feedback Header */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50/80 via-indigo-50/50 to-slate-50 border border-purple-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-900">
                      Writing Quality Assessment
                    </span>
                    <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-emerald-600" />
                      Clarity Score: {result.clarityScore}/100
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {result.overallFeedback}
                  </p>
                </div>
              </div>

              {/* Rewritten Text Box */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    <span>AI Revised Text ({result.style.toUpperCase()})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg shadow-2xs transition-all cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-700">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-slate-500" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleAdopt}
                      className="flex items-center gap-1 px-3 py-1 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs transition-all cursor-pointer"
                    >
                      <span>Apply to Editor</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-300 text-slate-900 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans select-text">
                  {result.rewrittenText}
                </div>
              </div>

              {/* Key Improvements Made */}
              {result.improvements && result.improvements.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Key Improvements Implemented
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {result.improvements.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-purple-50/50 border border-purple-100 text-xs text-purple-950 flex items-start gap-2"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Specific Phrase Transformations */}
              {result.keyChanges && result.keyChanges.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Linguistic Transformations
                  </h4>
                  <div className="space-y-2">
                    {result.keyChanges.map((change, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="line-through text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            {change.originalSnippet}
                          </span>
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                          <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {change.revisedSnippet}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 italic">
                          Rationale: {change.reason}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            <span>AI preserves your original core arguments while elevating tone and clarity.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
