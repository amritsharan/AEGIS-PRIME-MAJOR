import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  KeyRound, 
  Lock, 
  ShieldCheck, 
  ArrowRight, 
  Cpu, 
  CheckCircle2,
  Layers,
  Terminal
} from 'lucide-react';

export default function LuminaLoginScreen({ onLogin }) {
  const [operatorKey, setOperatorKey] = useState('SOVEREIGN-OPERATOR-LUMINA-70B');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleSubmit = (e) => {
    e?.preventDefault();
    setIsAuthenticating(true);
    setTimeout(() => {
      setIsAuthenticating(false);
      onLogin();
    }, 600);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-cyan-50/40 text-slate-900 font-sans flex items-center justify-center p-4 sm:p-6 relative overflow-hidden selection:bg-cyan-500 selection:text-white">
      
      {/* Background futuristic grid & ambient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-cyan-400/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Authentication Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="relative w-full max-w-lg bg-white/90 backdrop-blur-2xl rounded-3xl p-7 sm:p-9 border border-slate-200/90 shadow-2xl shadow-slate-900/10 space-y-7 z-10"
      >
        {/* Top Header & Sovereign Badge */}
        <div className="flex flex-col items-center text-center space-y-3">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 p-0.5 shadow-xl shadow-cyan-500/25"
          >
            <div className="w-full h-full rounded-[22px] bg-white flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-cyan-600" />
            </div>
          </motion.div>

          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-sans">
              SYNAPSE <span className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">OS</span>
            </h1>
            <div className="flex items-center justify-center gap-2">
              <span className="text-xs font-mono text-slate-500">Sovereign Microkernel Gateway</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-mono font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Lumina-Auth v2.4
              </span>
            </div>
          </div>
        </div>

        {/* Security Policy Telemetry Chips */}
        <div className="grid grid-cols-2 gap-2.5 text-xs font-mono">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-2 text-slate-700">
            <Lock className="w-4 h-4 text-cyan-600 shrink-0" />
            <div className="truncate">
              <span className="text-[10px] text-slate-400 block uppercase">PQC Lattice</span>
              <span className="font-bold text-[11px] text-slate-800">ML-KEM-768</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-2 text-slate-700">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <div className="truncate">
              <span className="text-[10px] text-slate-400 block uppercase">Isolation</span>
              <span className="font-bold text-[11px] text-emerald-700">WASM SFI Heap</span>
            </div>
          </div>
        </div>

        {/* Authentication Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-semibold text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                Operator Sovereign Access Key
              </span>
              <span className="text-[10px] text-slate-400 font-normal">τcap Capability</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={operatorKey}
                onChange={(e) => setOperatorKey(e.target.value)}
                placeholder="Enter Lumina capability token or Sovereign passkey..."
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:border-cyan-500 focus:ring-3 focus:ring-cyan-500/15 transition-all shadow-inner"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isAuthenticating}
            className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-600 hover:via-blue-700 hover:to-indigo-700 text-white font-bold font-mono text-xs sm:text-sm transition-all shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
          >
            {isAuthenticating ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Verifying Lumina Invariants...</span>
              </>
            ) : (
              <>
                <span>Authenticate & Enter Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Operator One-Click Badge */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>AEGIS-PRIME Security Mesh</span>
          </span>
          <button
            type="button"
            onClick={handleSubmit}
            className="text-cyan-700 hover:text-cyan-800 font-semibold transition-colors cursor-pointer"
          >
            Quick Sovereign Login
          </button>
        </div>
      </motion.div>
    </div>
  );
}
