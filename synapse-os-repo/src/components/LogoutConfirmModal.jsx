import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, ShieldAlert, X, Check } from 'lucide-react';

export default function LogoutConfirmModal({ 
  isOpen, 
  onCancel, 
  onConfirm 
}) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
        {/* Animated modal card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 12 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200/90 text-slate-900 overflow-hidden"
        >
          {/* Decorative subtle ambient glow */}
          <div className="absolute -top-16 -right-16 w-36 h-36 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Close corner button */}
          <button
            onClick={onCancel}
            className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex flex-col items-center text-center space-y-4">
            {/* Warning Icon Badge */}
            <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shadow-sm shadow-rose-500/10">
              <LogOut className="w-7 h-7 stroke-[2.2]" />
            </div>

            {/* Modal Title */}
            <div className="space-y-1.5">
              <h2 className="text-lg font-bold text-slate-900 font-mono tracking-tight">
                Are you willing to exit?
              </h2>
              <p className="text-xs text-slate-500 font-sans leading-relaxed max-w-xs mx-auto">
                Are you sure you want to end your current sovereign session? Your active Lumina-Auth capability tokens and session state will be locked.
              </p>
            </div>

            {/* Session notice badge */}
            <div className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-left flex items-start gap-2.5 text-xs font-mono text-slate-600">
              <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-800">Session Security Policy:</span>
                <p className="text-[11px] text-slate-500 font-sans mt-0.5">
                  Selecting <strong>No</strong> will instantly keep your existing session and chat history intact.
                </p>
              </div>
            </div>

            {/* Action Buttons: Yes / No */}
            <div className="grid grid-cols-2 gap-3 w-full pt-2">
              {/* No - Stay in Session */}
              <button
                onClick={onCancel}
                className="w-full py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold font-mono text-xs transition-all border border-slate-200 shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <X className="w-4 h-4 text-slate-500" />
                <span>No, Cancel</span>
              </button>

              {/* Yes - Confirm Logout */}
              <button
                onClick={onConfirm}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-bold font-mono text-xs transition-all shadow-md shadow-rose-500/25 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Yes, Logout</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
