import React, { useRef, useState, useMemo } from 'react';
import {
  Sparkles,
  Play,
  RotateCcw,
  Clipboard,
  FileText,
  Languages,
  Check,
  AlertCircle,
  Eye,
  Edit3,
  Bot,
  Zap,
} from 'lucide-react';
import { GrammarIssue, ReadabilityMetrics } from '../types';
import { SAMPLE_TEXTS } from '../utils/textMetrics';
import { CATEGORY_STYLES } from '../utils/grammarEngine';

interface GrammarEditorProps {
  text: string;
  setText: (text: string) => void;
  language: string;
  setLanguage: (lang: string) => void;
  isChecking: boolean;
  onCheck: () => void;
  onOpenAiWriter: () => void;
  onClear: () => void;
  issues: GrammarIssue[];
  selectedIssueId: string | null;
  onSelectIssue: (id: string) => void;
  metrics: ReadabilityMetrics;
  hasChecked: boolean;
  appliedCount: number;
}

export const GrammarEditor: React.FC<GrammarEditorProps> = ({
  text,
  setText,
  language,
  setLanguage,
  isChecking,
  onCheck,
  onOpenAiWriter,
  onClear,
  issues,
  selectedIssueId,
  onSelectIssue,
  metrics,
  hasChecked,
  appliedCount,
}) => {
  const [viewMode, setViewMode] = useState<'edit' | 'highlight'>('edit');
  const [copied, setCopied] = useState(false);
  const [showSampleDropdown, setShowSampleDropdown] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Filter active (unapplied and undismissed) issues for highlighting
  const activeIssues = useMemo(() => {
    return issues.filter((i) => !i.applied && !i.dismissed);
  }, [issues]);

  const handlePaste = async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      if (clipText) {
        setText(clipText);
        textareaRef.current?.focus();
      }
    } catch {
      // Fallback
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Cmd+Enter or Ctrl+Enter to trigger check
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      if (!isChecking && text.trim().length > 0) {
        onCheck();
      }
    }
  };

  const handleSelectSample = (sampleText: string) => {
    setText(sampleText);
    setShowSampleDropdown(false);
    setViewMode('edit');
  };

  // Render text segments with interactive underlined highlights
  const renderHighlightedContent = () => {
    if (!text) {
      return (
        <span className="text-slate-400 italic">
          No text entered yet. Type or paste your text to check for mistakes.
        </span>
      );
    }

    if (activeIssues.length === 0) {
      return <span>{text}</span>;
    }

    // Sort issues by offset
    const sorted = [...activeIssues].sort((a, b) => a.offset - b.offset);
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;

    sorted.forEach((issue) => {
      // Preceding regular text
      if (issue.offset > lastIndex) {
        elements.push(
          <span key={`text-${lastIndex}`}>{text.slice(lastIndex, issue.offset)}</span>
        );
      }

      // Highlighted issue token
      const issueText = text.slice(issue.offset, issue.offset + issue.length);
      const isSelected = selectedIssueId === issue.id;
      const styleMeta = CATEGORY_STYLES[issue.category] || CATEGORY_STYLES.grammar;

      elements.push(
        <button
          key={`issue-${issue.id}`}
          type="button"
          onClick={() => onSelectIssue(issue.id)}
          className={`inline rounded px-0.5 transition-all text-left font-inherit cursor-pointer ${
            styleMeta.underlineColor
          } ${styleMeta.bgTint} ${
            isSelected
              ? 'ring-2 ring-indigo-600 bg-indigo-100 font-semibold'
              : 'hover:bg-slate-200/80'
          }`}
          title={`${styleMeta.label}: ${issue.message}`}
        >
          {issueText || issue.originalText}
        </button>
      );

      lastIndex = issue.offset + issue.length;
    });

    // Trailing text
    if (lastIndex < text.length) {
      elements.push(
        <span key={`text-tail`}>{text.slice(lastIndex)}</span>
      );
    }

    return elements;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/90 overflow-hidden flex flex-col h-full">
      {/* Top Controls Bar */}
      <div className="p-3 sm:px-5 sm:py-3.5 bg-slate-50/80 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center flex-wrap gap-2">
          {/* Language Selector */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-700 shadow-2xs">
            <Languages className="w-3.5 h-3.5 text-indigo-600" />
            <select
              aria-label="Target English Language Variant"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-transparent font-medium text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="en-US">English (US)</option>
              <option value="en-GB">English (UK)</option>
              <option value="en-CA">English (Canada)</option>
              <option value="en-AU">English (Australia)</option>
            </select>
          </div>

          {/* Mode switch: Edit vs Highlight view */}
          {hasChecked && activeIssues.length > 0 && (
            <div className="flex items-center bg-slate-200/70 p-0.5 rounded-lg text-xs font-medium">
              <button
                onClick={() => setViewMode('edit')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                  viewMode === 'edit'
                    ? 'bg-white text-slate-800 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Edit3 className="w-3 h-3" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => setViewMode('highlight')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                  viewMode === 'highlight'
                    ? 'bg-indigo-600 text-white shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Eye className="w-3 h-3" />
                <span>Highlights ({activeIssues.length})</span>
              </button>
            </div>
          )}
        </div>

        {/* Action utility buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Sample Text Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSampleDropdown(!showSampleDropdown)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg shadow-2xs transition-colors"
              title="Insert predefined sample texts to test grammar mistakes"
            >
              <FileText className="w-3.5 h-3.5 text-purple-600" />
              <span>Sample Texts</span>
            </button>

            {showSampleDropdown && (
              <div className="absolute right-0 mt-1.5 w-64 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1.5 text-left animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Select a Sample Scenario
                </div>
                {SAMPLE_TEXTS.map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectSample(sample.text)}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-purple-50 transition-colors flex flex-col group"
                  >
                    <span className="font-medium text-slate-800 group-hover:text-purple-900">
                      {sample.title}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Category: {sample.category}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Paste button */}
          <button
            onClick={handlePaste}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg shadow-2xs transition-colors"
            title="Paste text from clipboard"
          >
            <Clipboard className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Paste</span>
          </button>

          {/* Clear button */}
          {text.length > 0 && (
            <button
              onClick={onClear}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-rose-700 bg-white hover:bg-rose-50 border border-slate-300 hover:border-rose-300 rounded-lg shadow-2xs transition-colors"
              title="Clear all text and reset results"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Editor Content Area */}
      <div className="relative flex-1 min-h-[300px] sm:min-h-[380px] p-4 sm:p-5">
        {viewMode === 'edit' ? (
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type or paste your text here to check grammar, spelling, and sentence structure... (Press Ctrl+Enter or Cmd+Enter to check)"
            className="w-full h-full min-h-[290px] sm:min-h-[360px] resize-none border-0 focus:ring-0 text-slate-800 text-sm sm:text-base leading-relaxed placeholder:text-slate-400 font-sans focus:outline-none"
            spellCheck={false}
          />
        ) : (
          <div className="w-full h-full min-h-[290px] sm:min-h-[360px] text-slate-800 text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-sans select-text overflow-y-auto pr-2">
            {renderHighlightedContent()}
          </div>
        )}

        {/* Floating shortcut badge */}
        <div className="absolute bottom-2 right-4 text-[11px] text-slate-400 pointer-events-none hidden sm:block">
          Press <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-300 font-mono text-[10px]">Ctrl+Enter</kbd> to check
        </div>
      </div>

      {/* Text Metrics & Bottom Bar */}
      <div className="px-4 py-3 bg-slate-50/90 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center flex-wrap gap-3 sm:gap-5">
          <div className="flex items-center gap-1 font-medium">
            <span className="text-slate-900 font-bold">{metrics.wordCount}</span> words
          </div>
          <div className="flex items-center gap-1 font-medium">
            <span className="text-slate-900 font-bold">{metrics.charCount}</span> chars
          </div>
          <div className="flex items-center gap-1 font-medium hidden sm:flex">
            <span className="text-slate-900 font-bold">{metrics.sentenceCount}</span> sentences
          </div>
          <div className="flex items-center gap-1 font-medium hidden md:flex">
            <span>~{metrics.readingTimeMinutes} min read</span>
          </div>
          {metrics.wordCount > 5 && (
            <div className="flex items-center gap-1.5 font-medium px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
              <Zap className="w-3 h-3 text-purple-600" />
              <span>Readability: {metrics.fleschScore}/100 ({metrics.readingGrade})</span>
            </div>
          )}
        </div>

        {/* Main Execution Actions */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={onOpenAiWriter}
            disabled={!text.trim()}
            className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 shadow-2xs transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Rewrite with Gemini AI in different tones (Formal, Casual, Academic, etc.)"
          >
            <Bot className="w-3.5 h-3.5 text-purple-600" />
            <span>Improve with AI</span>
          </button>

          <button
            onClick={onCheck}
            disabled={isChecking || !text.trim()}
            className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-sm shadow-indigo-200 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isChecking ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Checking...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Check Grammar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
