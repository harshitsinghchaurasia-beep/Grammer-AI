import React from 'react';
import { X, Sparkles, CheckCircle2, ShieldCheck, Cpu, Code2, HeartHandshake } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:px-6 sm:py-5 bg-gradient-to-r from-purple-50 via-indigo-50 to-white border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900">About GrammarGlow AI</h3>
              <p className="text-xs text-slate-500">Hacktoberfest Problem Statement #13 Submission</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-xs sm:text-sm text-slate-700 leading-relaxed">
          {/* Mission statement */}
          <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 text-purple-950">
            <h4 className="font-bold text-sm mb-1 text-purple-900">
              Problem Statement #13: Grammar Correction Tool
            </h4>
            <p className="text-xs text-purple-900/90 leading-relaxed">
              "Detect grammar, spelling, and sentence-structure errors and suggest corrections."
            </p>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-600" />
              <span>Dual-Engine Architecture</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="font-bold text-slate-900 text-xs mb-1">
                  1. Real-Time Grammar Engine (LanguageTool)
                </div>
                <p className="text-[11px] text-slate-600 leading-normal">
                  Performs deterministic rule-based checks for subject-verb agreement, casing, punctuation, homophones, and common typographical mistakes.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="font-bold text-slate-900 text-xs mb-1">
                  2. Gemini 3.8 Flash Neural Engine
                </div>
                <p className="text-[11px] text-slate-600 leading-normal">
                  Provides contextual rewrites, stylistic adaptation (Formal, Casual, Academic, Concise), clarity scoring, and bite-sized pedagogical explanations.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-2">
              <Code2 className="w-4 h-4 text-purple-600" />
              <span>Key Features Built</span>
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Interactive text highlighting with color-coded categories (Spelling, Grammar, Punctuation, Sentence Structure, Style).</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Safe non-overlapping single and batch correction application algorithms.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Side-by-side corrected text generator with token-level visual diff viewer.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Real-time readability metrics: Flesch Reading Ease score, grade level, and reading time estimation.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Multiple English dialect support: US, UK, Canada, Australia.</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-1 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Privacy & Security</span>
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              No user text is stored in databases or logged to persistent disks. Input data is held in-memory during analysis and processed via server-side secure proxies with zero credential leaks to client browsers.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <HeartHandshake className="w-4 h-4 text-rose-500" />
            <span>Built with passion for Hacktoberfest 2026</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
