export type IssueCategory = 'grammar' | 'spelling' | 'punctuation' | 'style' | 'structure';

export interface GrammarIssue {
  id: string;
  offset: number;
  length: number;
  originalText: string;
  message: string;
  shortMessage: string;
  ruleId: string;
  ruleDescription: string;
  category: IssueCategory;
  replacements: string[];
  sentence?: string;
  context?: string;
  applied?: boolean;
  dismissed?: boolean;
}

export interface IssuesSummary {
  total: number;
  grammar: number;
  spelling: number;
  punctuation: number;
  style: number;
  structure: number;
}

export interface GrammarCheckResponse {
  language: {
    name: string;
    code: string;
    detectedLanguage?: any;
  };
  issues: GrammarIssue[];
  correctedText: string;
  summary: IssuesSummary;
}

export type WritingStyle = 'formal' | 'casual' | 'academic' | 'concise' | 'professional';

export interface KeyChange {
  originalSnippet: string;
  revisedSnippet: string;
  reason: string;
}

export interface AiRewriteResponse {
  success: boolean;
  originalText: string;
  rewrittenText: string;
  style: WritingStyle;
  improvements: string[];
  keyChanges: KeyChange[];
  clarityScore: number;
  overallFeedback: string;
}

export interface AiExplainResponse {
  ruleExplanation: string;
  mnemonicOrTip: string;
  examples: Array<{
    incorrect: string;
    correct: string;
  }>;
}

export interface ReadabilityMetrics {
  wordCount: number;
  charCount: number;
  charCountNoSpaces: number;
  sentenceCount: number;
  paragraphCount: number;
  avgSentenceLength: number;
  readingTimeMinutes: number;
  fleschScore: number;
  readingGrade: string;
}

export interface ServerStatus {
  status: string;
  appName: string;
  version: string;
  geminiConfigured: boolean;
  grammarService: string;
  timestamp: string;
}
