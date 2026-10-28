import React from 'react';
import { ArrowDown, CheckCircle, Wand2, ShieldCheck, Sparkles, BookCheck } from 'lucide-react';

interface HeroProps {
  onCheckClick: () => void;
  onSampleClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onCheckClick, onSampleClick }) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-purple-50/60 via-slate-50 to-white pt-8 pb-10 sm:pt-12 sm:pb-14 border-b border-slate-200/60">
      {/* Decorative gradient blur background spots */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 pointer-events-none overflow-hidden opacity-60">
        <div className="absolute top-10 left-1/4 w-72 h-72 bg-purple-300/30 rounded-full blur-3xl" />
        <div className="absolute top-16 right-1/4 w-80 h-80 bg-indigo-300/30 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Hacktoberfest badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100/90 border border-purple-200 text-purple-900 text-xs font-semibold mb-4 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
          <span>Hacktoberfest Project #13 — Smart Grammar & Clarity Assistant</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 mb-4 sm:mb-6">
          Make Every Sentence{' '}
          <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
            Clearer.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl mx-auto text-base sm:text-xl text-slate-600 font-normal leading-relaxed mb-8">
          Your intelligent writing assistant for grammar, spelling, and better English.
          Detect errors in real-time, inspect explanations, and polish your prose with Gemini AI.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-8">
          <button
            onClick={onCheckClick}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-md shadow-indigo-200 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base group"
          >
            <span>Check My Writing</span>
            <ArrowDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
          </button>

          <button
            onClick={onSampleClick}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 hover:border-slate-400 shadow-2xs transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <BookCheck className="w-4 h-4 text-purple-600" />
            <span>Try Sample Text</span>
          </button>
        </div>

        {/* Feature highlight badges */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm text-slate-600 font-medium">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>LanguageTool Real Grammar API</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
            <Wand2 className="w-4 h-4 text-purple-600" />
            <span>Gemini AI Style Rewriter</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>In-Memory Privacy Guarantee</span>
          </div>
        </div>
      </div>
    </div>
  );
};
