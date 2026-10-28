import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Check,
  X,
  Sparkles,
  Layers,
  ChevronDown,
  ChevronUp,
  BrainCircuit,
  HelpCircle,
  Wand2,
} from 'lucide-react';
import { GrammarIssue, IssueCategory, AiExplainResponse } from '../types';
import { CATEGORY_STYLES } from '../utils/grammarEngine';

interface SuggestionsPanelProps {
  issues: GrammarIssue[];
  selectedIssueId: string | null;
  onSelectIssue: (id: string) => void;
  onApplySingle: (issueId: string, replacement: string) => void;
  onDismissSingle: (issueId: string) => void;
  onApplyAll: () => void;
  isChecking: boolean;
  hasChecked: boolean;
  totalIssuesCount: number;
  appliedCount: number;
}

export const SuggestionsPanel: React.FC<SuggestionsPanelProps> = ({
  issues,
  selectedIssueId,
  onSelectIssue,
  onApplySingle,
  onDismissSingle,
  onApplyAll,
  isChecking,
  hasChecked,
  totalIssuesCount,
  appliedCount,
}) => {
  const [categoryFilter, setCategoryFilter] = useState<'all' | IssueCategory>('all');
  const [explainingIssueId, setExplainingIssueId] = useState<string | null>(null);
  const [aiExplanations, setAiExplanations] = useState<Record<string, AiExplainResponse>>({});
  const [explainError, setExplainError] = useState<string | null>(null);

  // Active (undismissed) issues
  const undismissedIssues = issues.filter((i) => !i.dismissed);
  const unappliedCount = undismissedIssues.filter((i) => !i.applied).length;

  // Filtered issues
  const filteredIssues = undismissedIssues.filter((issue) => {
    if (categoryFilter === 'all') return true;
    return issue.category === categoryFilter;
  });

  // Category counts
  const categoryCounts = {
    all: undismissedIssues.length,
    grammar: undismissedIssues.filter((i) => i.category === 'grammar').length,
    spelling: undismissedIssues.filter((i) => i.category === 'spelling').length,
    punctuation: undismissedIssues.filter((i) => i.category === 'punctuation').length,
    structure: undismissedIssues.filter((i) => i.category === 'structure').length,
    style: undismissedIssues.filter((i) => i.category === 'style').length,
  };

  // Request AI explanation for an individual issue
  const handleExplainWithAi = async (issue: GrammarIssue) => {
    if (aiExplanations[issue.id]) {
      setExplainingIssueId(explainingIssueId === issue.id ? null : issue.id);
      return;
    }

    setExplainingIssueId(issue.id);
    setExplainError(null);

    try {
      const res = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issue }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'AI explanation service currently unavailable.');
      }

      const data: AiExplainResponse = await res.json();
      setAiExplanations((prev) => ({ ...prev, [issue.id]: data }));
    } catch (err: any) {
      console.error('Failed to get AI explanation:', err);
      setExplainError(err.message || 'Failed to load AI explanation.');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/90 overflow-hidden flex flex-col h-full">
      {/* Header with Title and "Apply All" */}
      <div className="p-3 sm:px-5 sm:py-3.5 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
            {unappliedCount}
          </div>
          <h2 className="text-sm sm:text-base font-bold text-slate-800">
            Suggestions & Fixes
          </h2>
        </div>

        {unappliedCount > 0 && (
          <button
            onClick={onApplyAll}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
            title="Automatically apply the primary suggestion for all detected issues"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Apply All ({unappliedCount})</span>
          </button>
        )}
      </div>

      {/* Category Filter Pills */}
      {undismissedIssues.length > 0 && (
        <div className="px-4 py-2 bg-white border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto text-xs scrollbar-none">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors font-medium flex items-center gap-1 ${
              categoryFilter === 'all'
                ? 'bg-slate-800 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>All</span>
            <span className="text-[10px] opacity-80">({categoryCounts.all})</span>
          </button>

          {(['spelling', 'grammar', 'punctuation', 'structure', 'style'] as IssueCategory[]).map(
            (cat) => {
              const count = categoryCounts[cat];
              if (count === 0) return null;
              const meta = CATEGORY_STYLES[cat];
              const isSelected = categoryFilter === cat;

              return (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors font-medium flex items-center gap-1.5 ${
                    isSelected
                      ? `${meta.badgeBg} ${meta.badgeText} ring-1 ring-inset ring-current font-semibold`
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${meta.dotColor}`} />
                  <span>{meta.label}</span>
                  <span className="text-[10px] opacity-80">({count})</span>
                </button>
              );
            }
          )}
        </div>
      )}

      {/* Suggestions List Container */}
      <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-3 min-h-[300px]">
        {/* Loading state */}
        {isChecking && (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-3" />
            <p className="text-sm font-semibold text-slate-700">Analyzing text with LanguageTool engine...</p>
            <p className="text-xs text-slate-500 mt-1">Scanning syntax, spelling, and sentence structures</p>
          </div>
        )}

        {/* Empty state before any check */}
        {!isChecking && !hasChecked && (
          <div className="py-12 px-4 flex flex-col items-center justify-center text-center text-slate-500">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center mb-3">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-700 mb-1">Ready to inspect your writing</h3>
            <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
              Click <strong className="text-indigo-600">Check Grammar</strong> or select a sample text to detect grammar, spelling, and stylistic errors.
            </p>
          </div>
        )}

        {/* Flawless / Clean text state */}
        {!isChecking && hasChecked && undismissedIssues.length === 0 && (
          <div className="py-12 px-4 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3.5 shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-emerald-900 mb-1">
              Flawless Writing!
            </h3>
            <p className="text-xs text-slate-600 max-w-xs leading-relaxed mb-3">
              No spelling, grammar, or punctuation errors were detected in your text.
            </p>
            {appliedCount > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium">
                <Check className="w-3.5 h-3.5" />
                <span>{appliedCount} correction{appliedCount > 1 ? 's' : ''} successfully applied!</span>
              </span>
            )}
          </div>
        )}

        {/* List of Issue Cards */}
        {!isChecking &&
          filteredIssues.map((issue) => {
            const meta = CATEGORY_STYLES[issue.category] || CATEGORY_STYLES.grammar;
            const isSelected = selectedIssueId === issue.id;
            const isExplaining = explainingIssueId === issue.id;
            const explanation = aiExplanations[issue.id];

            return (
              <div
                key={issue.id}
                onClick={() => onSelectIssue(issue.id)}
                className={`rounded-xl border transition-all duration-150 p-3.5 text-left ${
                  issue.applied
                    ? 'bg-emerald-50/50 border-emerald-200 opacity-70'
                    : isSelected
                    ? 'bg-white border-indigo-500 shadow-md ring-2 ring-indigo-100'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                }`}
              >
                {/* Issue header: category badge + dismiss */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${meta.badgeBg} ${meta.badgeText}`}
                    >
                      {meta.label}
                    </span>
                    {issue.ruleId && (
                      <span className="text-[10px] text-slate-400 font-mono hidden sm:inline" title={issue.ruleId}>
                        {issue.ruleId.slice(0, 18)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {issue.applied && (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                        <Check className="w-3 h-3" />
                        Applied
                      </span>
                    )}
                    {!issue.applied && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDismissSingle(issue.id);
                        }}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                        title="Dismiss this suggestion"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Problem description */}
                <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-snug mb-2">
                  {issue.message}
                </p>

                {/* Original snippet context */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2 text-xs mb-3 flex items-start gap-2">
                  <span className="text-slate-400 font-mono text-[11px] select-none">Context:</span>
                  <div className="text-slate-700 flex-1">
                    {issue.sentence ? (
                      <span>
                        "{issue.sentence}"
                      </span>
                    ) : (
                      <span className="line-through text-rose-600 font-medium">
                        "{issue.originalText}"
                      </span>
                    )}
                  </div>
                </div>

                {/* Replacement Options */}
                {issue.replacements.length > 0 && !issue.applied && (
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Suggested Fix:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {issue.replacements.map((rep, idx) => (
                        <button
                          key={idx}
                          onClick={(e) => {
                            e.stopPropagation();
                            onApplySingle(issue.id, rep);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                            idx === 0
                              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-2xs hover:from-purple-700 hover:to-indigo-700'
                              : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
                          }`}
                          title={`Replace "${issue.originalText}" with "${rep}"`}
                        >
                          <Check className="w-3 h-3" />
                          <span>{rep}</span>
                          {idx === 0 && <span className="text-[9px] uppercase tracking-wider opacity-80">(Best)</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* "Ask AI to Explain" Toggle Button */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExplainWithAi(issue);
                    }}
                    className="flex items-center gap-1 font-medium text-purple-700 hover:text-purple-900 transition-colors"
                  >
                    <Wand2 className="w-3.5 h-3.5 text-purple-600" />
                    <span>Explain Rule with AI</span>
                    {isExplaining ? (
                      <ChevronUp className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    )}
                  </button>
                </div>

                {/* Expanded AI Explanation Drawer */}
                {isExplaining && (
                  <div className="mt-2.5 p-3 rounded-xl bg-purple-50/70 border border-purple-200/80 text-xs text-slate-700 space-y-2 animate-in fade-in duration-150">
                    {!explanation && !explainError && (
                      <div className="flex items-center gap-2 py-2 text-purple-700">
                        <div className="w-3.5 h-3.5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                        <span>Gemini is generating rule insights & tips...</span>
                      </div>
                    )}

                    {explainError && (
                      <div className="text-rose-600 text-[11px] font-medium">
                        {explainError}
                      </div>
                    )}

                    {explanation && (
                      <>
                        <div>
                          <span className="font-bold text-purple-950">Why this is an error: </span>
                          <span className="text-slate-800">{explanation.ruleExplanation}</span>
                        </div>

                        {explanation.mnemonicOrTip && (
                          <div className="p-2 bg-white rounded-lg border border-purple-200 text-purple-900 font-medium flex items-start gap-1.5">
                            <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                            <span>Tip: {explanation.mnemonicOrTip}</span>
                          </div>
                        )}

                        {explanation.examples && explanation.examples.length > 0 && (
                          <div className="space-y-1">
                            <span className="font-bold text-[11px] text-slate-500 uppercase tracking-wider">
                              Examples:
                            </span>
                            {explanation.examples.map((ex, exIdx) => (
                              <div key={exIdx} className="grid grid-cols-2 gap-1.5 text-[11px]">
                                <div className="p-1.5 rounded bg-rose-50 text-rose-800 border border-rose-200">
                                  <span className="font-bold">❌ </span>
                                  {ex.incorrect}
                                </div>
                                <div className="p-1.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                                  <span className="font-bold">✓ </span>
                                  {ex.correct}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
};
