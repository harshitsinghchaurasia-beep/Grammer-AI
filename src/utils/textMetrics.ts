import { ReadabilityMetrics } from '../types';

/**
 * Counts syllables in an English word approximation using standard linguistic heuristics
 */
export function countSyllables(word: string): number {
  const cleaned = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!cleaned) return 0;
  if (cleaned.length <= 3) return 1;

  // Remove silent ending 'e', 'es', 'ed' if not preceded by certain consonants
  let w = cleaned.replace(/(?:[^laeiouy]|ed|es|e)$/, '');
  w = w.replace(/^y/, '');
  const matches = w.match(/[aeiouy]{1,2}/g);
  return matches ? Math.max(1, matches.length) : 1;
}

/**
 * Computes readability metrics including Flesch Reading Ease and Grade Level
 */
export function computeReadabilityMetrics(text: string): ReadabilityMetrics {
  const trimmed = text.trim();
  if (!trimmed) {
    return {
      wordCount: 0,
      charCount: 0,
      charCountNoSpaces: 0,
      sentenceCount: 0,
      paragraphCount: 0,
      avgSentenceLength: 0,
      readingTimeMinutes: 0,
      fleschScore: 100,
      readingGrade: 'N/A',
    };
  }

  const charCount = text.length;
  const charCountNoSpaces = text.replace(/\s/g, '').length;

  // Words matching alphanumeric tokens
  const words = trimmed.match(/\b[A-Za-z0-9'-]+\b/g) || [];
  const wordCount = words.length;

  // Sentences ending with . ! ? or newline
  const rawSentences = text
    .split(/[.!?]+[\s\r\n]+|[.!?]+$/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  const sentenceCount = Math.max(1, rawSentences.length);

  // Paragraphs
  const paragraphs = text
    .split(/\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
  const paragraphCount = Math.max(1, paragraphs.length);

  // Average reading speed: ~225 words per minute
  const readingTimeMinutes = Math.max(0.1, Number((wordCount / 225).toFixed(1)));

  // Syllables
  let totalSyllables = 0;
  for (const word of words) {
    totalSyllables += countSyllables(word);
  }

  const avgSentenceLength = wordCount > 0 ? Number((wordCount / sentenceCount).toFixed(1)) : 0;

  // Flesch Reading Ease Formula
  // 206.835 - 1.015 * (total_words / total_sentences) - 84.6 * (total_syllables / total_words)
  let fleschScore = 100;
  if (wordCount > 0) {
    const rawScore = 206.835 - 1.015 * (wordCount / sentenceCount) - 84.6 * (totalSyllables / wordCount);
    fleschScore = Math.min(100, Math.max(0, Math.round(rawScore)));
  }

  let readingGrade = 'Standard';
  if (fleschScore >= 90) readingGrade = 'Very Easy (5th Grade)';
  else if (fleschScore >= 80) readingGrade = 'Easy (6th Grade)';
  else if (fleschScore >= 70) readingGrade = 'Fairly Easy (7th Grade)';
  else if (fleschScore >= 60) readingGrade = 'Standard (8th-9th Grade)';
  else if (fleschScore >= 50) readingGrade = 'Fairly Difficult (High School)';
  else if (fleschScore >= 30) readingGrade = 'Difficult (College)';
  else readingGrade = 'Very Confusing / Scholarly';

  return {
    wordCount,
    charCount,
    charCountNoSpaces,
    sentenceCount,
    paragraphCount,
    avgSentenceLength,
    readingTimeMinutes,
    fleschScore,
    readingGrade,
  };
}

/**
 * Token-level diff comparison for comparing original and corrected text
 */
export interface DiffToken {
  type: 'same' | 'added' | 'removed';
  value: string;
}

export function computeWordDiff(original: string, corrected: string): DiffToken[] {
  // Simple word & whitespace tokenization for fast diffing
  const origTokens = original.split(/(\s+|[.,!?;:()"])/).filter((t) => t.length > 0);
  const corrTokens = corrected.split(/(\s+|[.,!?;:()"])/).filter((t) => t.length > 0);

  // Compute Longest Common Subsequence (LCS) matrix
  const m = origTokens.length;
  const n = corrTokens.length;

  // Guard against massive inputs to avoid large memory tables
  if (m * n > 400000) {
    return [
      { type: 'removed', value: original },
      { type: 'added', value: corrected },
    ];
  }

  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (origTokens[i] === corrTokens[j]) {
        dp[i + 1][j + 1] = dp[i][j] + 1;
      } else {
        dp[i + 1][j + 1] = Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
  }

  // Backtrack to build diff
  const diff: DiffToken[] = [];
  let i = m;
  let j = n;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && origTokens[i - 1] === corrTokens[j - 1]) {
      diff.unshift({ type: 'same', value: origTokens[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      diff.unshift({ type: 'added', value: corrTokens[j - 1] });
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      diff.unshift({ type: 'removed', value: origTokens[i - 1] });
      i--;
    }
  }

  return diff;
}

/**
 * Rich sample texts designed to test multiple error types
 */
export const SAMPLE_TEXTS = [
  {
    title: 'Workplace Email (Common Errors)',
    category: 'Business',
    text: `Hi team,\n\nI hope your having a good week. The marketing department have completed their quarterly audit yesterday, but there is several issues with the financial spreadsheet.\n\nEach of the team members need to submit there reports by Friday afternoon. If anyone have questions please contact me or Sarah directly. Its important that we finishes this on schedule.\n\nThanks for you're cooperation!`,
  },
  {
    title: 'Academic Essay (Structure & Agreement)',
    category: 'Academic',
    text: `Recent studies in artificial intelligence shows that language models can significantly improves student writing abilities. However, the data does not demonstrates whether students relies to heavily on automated recommendations.\n\nFurthermore, between the two proposed solutions, the latter is definitely the most effective approach. Neither the professor nor the research assistants was aware of the bias in the dataset.\n\nIn conclusion, further investigation are required before reaching a definitive judgement.`,
  },
  {
    title: 'Spelling & Punctuation Pitfalls',
    category: 'Spelling',
    text: `Definately check you're work before submitting it to the principal. Their are to many preventable mistakes in this draft, including missing apostrophe's and unnecesary commas. When we recieved the notification, we was completely surprised by the sudden change in schedule!`,
  },
  {
    title: 'Job Cover Letter (Awkward Phrasing)',
    category: 'Career',
    text: `Dear Hiring Manager,\n\nI am writing to express my eager interest for the Senior Software position. My five years experience in software engineering have prepared me well for this role. I am very much looking forward to utilize my skills to help your company grow and succeed in a rapid manner.\n\nAttached please find my resume which outlines my past achievements. I would be grateful for the oportunity to discuss how I can contribute to you're team.\n\nSincerely,\nAlex Morgan`,
  },
];
