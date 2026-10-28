import React from 'react';
import { Sparkles, CheckCircle2, Bot, Info, BookOpen, ShieldCheck } from 'lucide-react';
import { ServerStatus } from '../types';

interface NavbarProps {
  serverStatus: ServerStatus | null;
  onOpenAbout: () => void;
  onOpenPrivacy: () => void;
  onOpenAiWriter: () => void;
  onScrollToEditor: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  serverStatus,
  onOpenAbout,
  onOpenPrivacy,
  onOpenAiWriter,
  onScrollToEditor,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Logo */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={onScrollToEditor}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-200 ring-2 ring-purple-100">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-purple-900 via-indigo-800 to-purple-700 bg-clip-text text-transparent">
                GrammarGlow
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                AI
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
              Write Better. Communicate Smarter.
            </p>
          </div>
        </div>

        {/* Navigation & Actions */}
        <div className="flex items-center space-x-1 sm:space-x-3">
          <button
            onClick={onScrollToEditor}
            className="px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4 text-indigo-600" />
            <span className="hidden sm:inline">Grammar</span> Checker
          </button>

          <button
            onClick={onOpenAiWriter}
            className="px-3 py-1.5 text-xs sm:text-sm font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Bot className="w-4 h-4 text-purple-600" />
            <span>AI Writer</span>
          </button>

          <button
            onClick={onOpenAbout}
            className="p-1.5 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5"
            title="About Project & Hacktoberfest Problem Statement"
          >
            <Info className="w-4 h-4 text-slate-500" />
            <span className="hidden md:inline">About</span>
          </button>

          <button
            onClick={onOpenPrivacy}
            className="p-1.5 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5"
            title="Privacy & Data Disclosure"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="hidden lg:inline">Privacy</span>
          </button>

          {/* Engine Status Indicators */}
          <div className="hidden xl:flex items-center space-x-2 pl-3 border-l border-slate-200 text-xs">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              LanguageTool Active
            </span>
            {serverStatus?.geminiConfigured ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                Gemini 3.8 Ready
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-medium" title="Basic features work without Gemini. Add GEMINI_API_KEY for AI rewriter.">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                AI Key Optional
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
