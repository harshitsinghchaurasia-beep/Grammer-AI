import React from 'react';
import { X, ShieldCheck, Lock, EyeOff, Server, Check } from 'lucide-react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 sm:px-6 sm:py-5 bg-gradient-to-r from-emerald-50 via-teal-50 to-white border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900">Privacy & Data Notice</h3>
              <p className="text-xs text-slate-500">Transparent processing disclosure</p>
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
        <div className="p-5 sm:p-6 space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <p className="text-slate-600">
            GrammarGlow AI is built with privacy-by-design. We believe that your private writing, essays, and workplace correspondence should remain your own.
          </p>

          <div className="space-y-3 pt-1">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
              <Lock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 block text-xs">Zero Persistent Storage</span>
                <span className="text-[11px] text-slate-600">
                  Your submitted text is held exclusively in volatile server memory for the duration of the request and is discarded immediately after analysis.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
              <Server className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 block text-xs">Secure Server Proxy</span>
                <span className="text-[11px] text-slate-600">
                  Requests to external APIs (LanguageTool and Google Gemini) are dispatched through our secure backend proxy. No client credentials, cookies, or secrets are ever exposed.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
              <EyeOff className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 block text-xs">Explicit Actions Only</span>
                <span className="text-[11px] text-slate-600">
                  We never trigger background API requests on keystroke. Grammar analysis and AI rewrites occur exclusively when you explicitly press the corresponding button.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 transition-colors"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
