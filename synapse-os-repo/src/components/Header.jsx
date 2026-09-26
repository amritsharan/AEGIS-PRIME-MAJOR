import React, { useState, useEffect } from 'react';
import { ShieldCheck, Cpu, KeyRound, AlertTriangle, Activity, Zap } from 'lucide-react';

export default function Header({ systemState, vramUsage, capabilityTtl, activeTab }) {
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="glass-panel border-b border-slate-800/80 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-40">
      {/* Brand & Subsystem Title */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 via-blue-600/20 to-magenta-500/20 border border-cyan-500/30 shadow-lg shadow-cyan-500/10">
          <Zap className="w-5 h-5 text-cyan-400 animate-pulse" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-4 ring-emerald-950/50" />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold tracking-tight text-white font-mono flex items-center gap-2">
              SYNAPSE-OS
              <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-800/50">
                AEGIS-PRIME LAYER 2
              </span>
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-mono">
            Capability-Based Agentic Microkernel • Wasmtime SFI • Z3 SMT Prover
          </p>
        </div>
      </div>

      {/* Hardware & Security Telemetry Badges */}
      <div className="flex items-center gap-3 text-xs font-mono">
        {/* System Status Pill */}
        <div className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 transition-all ${
          systemState === 'KILLED'
            ? 'bg-red-950/80 text-red-400 border-red-500/50 animate-pulse shadow-lg shadow-red-900/30'
            : systemState === 'STREAMING'
            ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40'
            : 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30'
        }`}>
          {systemState === 'KILLED' ? (
            <>
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span>SIGKILL DISPATCHED (0x00 ZERO-FILL)</span>
            </>
          ) : systemState === 'STREAMING' ? (
            <>
              <Activity className="w-4 h-4 text-cyan-400 animate-spin" />
              <span>EADC TOKEN STREAM ACTIVE</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>WASMTIME SFI SECURE</span>
            </>
          )}
        </div>

        {/* AirLLM VRAM Telemetry */}
        <div className="px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-violet-400" />
          <span>VRAM: <strong className="text-violet-300">{vramUsage.toFixed(1)} GB</strong> / 4.0 GB (AirLLM 70B)</span>
        </div>

        {/* Capability Token TTL */}
        <div className="px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-amber-400" />
          <span>τcap TTL: <strong className="text-amber-300">{capabilityTtl}s</strong></span>
        </div>

        {/* Real-time Clock */}
        <div className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hidden sm:block">
          {time}
        </div>
      </div>
    </header>
  );
}
