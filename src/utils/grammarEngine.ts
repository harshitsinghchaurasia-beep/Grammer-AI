import { GrammarIssue, IssueCategory } from '../types';

/**
 * Safely applies an individual suggestion to text and adjusts offsets of remaining issues
 */
export function applySingleCorrection(
  text: string,
  targetIssueId: string,
  replacement: string,
  issues: GrammarIssue[]
): { updatedText: string; updatedIssues: GrammarIssue[] } {
  const target = issues.find((i) => i.id === targetIssueId);
  if (!target) return { updatedText: text, updatedIssues: issues };

  const start = target.offset;
  const end = target.offset + target.length;
  const delta = replacement.length - target.length;

  const updatedText = text.slice(0, start) + replacement + text.slice(end);

  const updatedIssues = issues.map((issue) => {
    if (issue.id === targetIssueId) {
      return {
        ...issue,
        applied: true,
        originalText: replacement,
      };
    }

    // If this issue is after the replaced chunk, adjust its offset
    if (issue.offset >= end) {
      return {
        ...issue,
        offset: issue.offset + delta,
      };
    }

    // If an issue overlapped directly with the replaced section, mark it dismissed
    if (issue.offset >= start && issue.offset < end) {
      return {
        ...issue,
        dismissed: true,
      };
    }

    return issue;
  });

  return { updatedText, updatedIssues };
}

/**
 * Safely applies all available first suggestions from right-to-left
 */
export function applyAllCorrections(
  text: string,
  issues: GrammarIssue[]
): { updatedText: string; appliedCount: number; updatedIssues: GrammarIssue[] } {
  // Filter active issues with replacements
  const active = issues
    .filter((i) => !i.applied && !i.dismissed && i.replacements && i.replacements.length > 0)
    .sort((a, b) => b.offset - a.offset); // Descending

  let result = text;
  let appliedCount = 0;
  let lastHandledOffset = Number.MAX_SAFE_INTEGER;
  const appliedIds = new Set<string>();

  for (const issue of active) {
    const end = issue.offset + issue.length;
    if (end > lastHandledOffset) {
      // Overlaps with already handled region
      continue;
    }

    const replacement = issue.replacements[0];
    result = result.slice(0, issue.offset) + replacement + result.slice(end);
    lastHandledOffset = issue.offset;
    appliedIds.add(issue.id);
    appliedCount++;
  }

  const updatedIssues = issues.map((i) => ({
    ...i,
    applied: appliedIds.has(i.id) ? true : i.applied,
  }));

  return {
    updatedText: result,
    appliedCount,
    updatedIssues,
  };
}

/**
 * Category styling metadata for badges and highlights
 */
export interface CategoryStyle {
  label: string;
  badgeBg: string;
  badgeText: string;
  underlineColor: string;
  borderHover: string;
  bgTint: string;
  dotColor: string;
}

export const CATEGORY_STYLES: Record<IssueCategory, CategoryStyle> = {
  spelling: {
    label: 'Spelling',
    badgeBg: 'bg-rose-50 border border-rose-200',
    badgeText: 'text-rose-700',
    underlineColor: 'decoration-rose-500 decoration-wavy underline decoration-2',
    borderHover: 'hover:border-rose-400',
    bgTint: 'bg-rose-50/60',
    dotColor: 'bg-rose-500',
  },
  grammar: {
    label: 'Grammar',
    badgeBg: 'bg-indigo-50 border border-indigo-200',
    badgeText: 'text-indigo-700',
    underlineColor: 'decoration-indigo-500 decoration-wavy underline decoration-2',
    borderHover: 'hover:border-indigo-400',
    bgTint: 'bg-indigo-50/60',
    dotColor: 'bg-indigo-500',
  },
  punctuation: {
    label: 'Punctuation',
    badgeBg: 'bg-amber-50 border border-amber-200',
    badgeText: 'text-amber-700',
    underlineColor: 'decoration-amber-500 decoration-wavy underline decoration-2',
    borderHover: 'hover:border-amber-400',
    bgTint: 'bg-amber-50/60',
    dotColor: 'bg-amber-500',
  },
  structure: {
    label: 'Sentence Structure',
    badgeBg: 'bg-teal-50 border border-teal-200',
    badgeText: 'text-teal-700',
    underlineColor: 'decoration-teal-500 decoration-wavy underline decoration-2',
    borderHover: 'hover:border-teal-400',
    bgTint: 'bg-teal-50/60',
    dotColor: 'bg-teal-500',
  },
  style: {
    label: 'Style & Clarity',
    badgeBg: 'bg-purple-50 border border-purple-200',
    badgeText: 'text-purple-700',
    underlineColor: 'decoration-purple-500 decoration-wavy underline decoration-2',
    borderHover: 'hover:border-purple-400',
    bgTint: 'bg-purple-50/60',
    dotColor: 'bg-purple-500',
  },
};
